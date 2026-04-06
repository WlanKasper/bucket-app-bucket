const baseUrl = process.env.BUCKET_BASE_URL ?? "http://127.0.0.1:3000";

function getCookieValue(response) {
  const cookieHeader = response.headers.get("set-cookie");

  if (!cookieHeader) {
    throw new Error("Session response did not include a cookie");
  }

  return cookieHeader.split(";")[0];
}

async function parseJson(response) {
  const text = await response.text();
  return text ? JSON.parse(text) : {};
}

async function createSession(devUser) {
  const sessionResponse = await fetch(`${baseUrl}/api/session`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(devUser ? { devUser } : {}),
  });

  if (!sessionResponse.ok) {
    throw new Error(`Session bootstrap failed with ${sessionResponse.status}`);
  }

  return {
    cookie: getCookieValue(sessionResponse),
    payload: await parseJson(sessionResponse),
  };
}

async function api(path, { method = "GET", cookie, body } = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(cookie ? { Cookie: cookie } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  return {
    response,
    payload: await parseJson(response),
  };
}

async function main() {
  const ownerSession = await createSession();
  const collaboratorSession = await createSession({
    telegramUserId: "999000002",
    username: "bucket_collab_dev",
    firstName: "Collab",
    lastName: "Dev",
  });

  const createResult = await api("/api/buckets", {
    method: "POST",
    cookie: ownerSession.cookie,
    body: {
      name: "AI smoke bucket",
      description: "Created by the smoke test",
    },
  });

  if (!createResult.response.ok) {
    throw new Error(
      `Bucket creation failed with ${createResult.response.status}: ${createResult.payload.error ?? "unknown error"}`
    );
  }

  const createdBucketId = createResult.payload.bucket?.id;

  if (!createdBucketId) {
    throw new Error("Bucket creation did not return an id");
  }

  const updateResult = await api(`/api/buckets/${createdBucketId}`, {
    method: "PATCH",
    cookie: ownerSession.cookie,
    body: {
      name: "AI smoke bucket updated",
      description: "Updated by the smoke test",
      items: [
        {
          id: "item-1",
          text: "Smoke item",
          checked: true,
        },
      ],
    },
  });

  if (!updateResult.response.ok) {
    throw new Error(
      `Bucket update failed with ${updateResult.response.status}: ${updateResult.payload.error ?? "unknown error"}`
    );
  }

  const shareResult = await api(`/api/buckets/${createdBucketId}/share`, {
    method: "POST",
    cookie: ownerSession.cookie,
    body: {
      username: collaboratorSession.payload.user?.username,
    },
  });

  if (!shareResult.response.ok) {
    throw new Error(
      `Bucket share failed with ${shareResult.response.status}: ${shareResult.payload.error ?? "unknown error"}`
    );
  }

  const collaboratorListResult = await api("/api/buckets", {
    cookie: collaboratorSession.cookie,
  });

  if (!collaboratorListResult.response.ok) {
    throw new Error(
      `Collaborator listing failed with ${collaboratorListResult.response.status}: ${collaboratorListResult.payload.error ?? "unknown error"}`
    );
  }

  const collaboratorBucket = collaboratorListResult.payload.buckets?.find(
    (bucket) => bucket.id === createdBucketId
  );

  if (!collaboratorBucket) {
    throw new Error("Shared bucket was not visible to collaborator");
  }

  const collaboratorUpdateResult = await api(`/api/buckets/${createdBucketId}`, {
    method: "PATCH",
    cookie: collaboratorSession.cookie,
    body: {
      items: [
        {
          id: "item-1",
          text: "Smoke item updated by collaborator",
          checked: true,
        },
      ],
    },
  });

  if (!collaboratorUpdateResult.response.ok) {
    throw new Error(
      `Collaborator update failed with ${collaboratorUpdateResult.response.status}: ${collaboratorUpdateResult.payload.error ?? "unknown error"}`
    );
  }

  const unshareResult = await api(`/api/buckets/${createdBucketId}/share`, {
    method: "DELETE",
    cookie: ownerSession.cookie,
    body: {
      username: collaboratorSession.payload.user?.username,
    },
  });

  if (!unshareResult.response.ok) {
    throw new Error(
      `Bucket unshare failed with ${unshareResult.response.status}: ${unshareResult.payload.error ?? "unknown error"}`
    );
  }

  const finalCollaboratorListResult = await api("/api/buckets", {
    cookie: collaboratorSession.cookie,
  });

  if (!finalCollaboratorListResult.response.ok) {
    throw new Error(
      `Final collaborator listing failed with ${finalCollaboratorListResult.response.status}: ${finalCollaboratorListResult.payload.error ?? "unknown error"}`
    );
  }

  const stillShared = finalCollaboratorListResult.payload.buckets?.some(
    (bucket) => bucket.id === createdBucketId
  );

  if (stillShared) {
    throw new Error("Unshared bucket was still visible to collaborator");
  }

  const deleteResult = await api(`/api/buckets/${createdBucketId}`, {
    method: "DELETE",
    cookie: ownerSession.cookie,
  });

  if (!deleteResult.response.ok) {
    throw new Error(
      `Bucket deletion failed with ${deleteResult.response.status}: ${deleteResult.payload.error ?? "unknown error"}`
    );
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        owner: ownerSession.payload.user?.username,
        collaborator: collaboratorSession.payload.user?.username,
        bucketId: createdBucketId,
        shareTested: true,
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
