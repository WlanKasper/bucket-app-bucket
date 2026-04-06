import { io, Socket } from "socket.io-client";
import { store } from "@/store/configureStore";
import { bucketActions } from "@/store/bucket";
import { Bucket, PresenceUser } from "@/model/bucket";
import config from "@/config";

class SocketService {
  private socket: Socket | null = null;
  private userId: string | null = null;
  private username: string | null = null;
  private currentBucketId: string | null = null;

  connect(userId: string, username: string) {
    if (this.socket?.connected) {
      return;
    }

    this.userId = userId;
    this.username = username;

    // Connect to the bucket namespace
    const baseUrl = config.BUCKET_SERVER_ENDPOINT || window.location.origin;
    this.socket = io(`${baseUrl}/bucket`, {
      transports: ["websocket", "polling"],
    });

    this.socket.on("connect", () => {
      console.log("WebSocket connected:", this.socket?.id);
    });

    this.socket.on("disconnect", () => {
      console.log("WebSocket disconnected");
    });

    // Listen for presence updates
    this.socket.on(
      "presence-update",
      (data: { bucketId: string; users: PresenceUser[] }) => {
        console.log("Presence update:", data);
        store.dispatch(
          bucketActions.setPresence({
            bucketId: data.bucketId,
            users: data.users,
          })
        );
      }
    );

    // Listen for bucket updates (real-time sync)
    this.socket.on("bucket-updated", (bucket: Bucket) => {
      console.log("Bucket updated via WebSocket:", bucket._id);
      store.dispatch(bucketActions.updateBucketFromSocket(bucket));
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.userId = null;
    this.username = null;
    this.currentBucketId = null;
  }

  joinBucket(bucketId: string) {
    if (!this.socket || !this.userId || !this.username) {
      console.warn("Cannot join bucket: socket not connected or user not set");
      return;
    }

    // Leave previous bucket if any
    if (this.currentBucketId && this.currentBucketId !== bucketId) {
      this.leaveBucket();
    }

    console.log("Joining bucket:", bucketId);
    this.socket.emit("join-bucket", {
      bucketId,
      userId: this.userId,
      username: this.username,
    });
    this.currentBucketId = bucketId;
  }

  leaveBucket() {
    if (!this.socket || !this.currentBucketId) {
      return;
    }

    console.log("Leaving bucket:", this.currentBucketId);
    this.socket.emit("leave-bucket");

    // Clear presence for this bucket
    store.dispatch(bucketActions.clearPresence(this.currentBucketId));
    this.currentBucketId = null;
  }

  startEditing(bucketId: string) {
    if (!this.socket) return;
    this.socket.emit("editing-start", { bucketId });
  }

  stopEditing(bucketId: string) {
    if (!this.socket) return;
    this.socket.emit("editing-stop", { bucketId });
  }

  getSocketId(): string | undefined {
    return this.socket?.id;
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

// Singleton instance
export const socketService = new SocketService();
