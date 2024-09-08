import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { Checkbox } from "expo-checkbox";
import { useDispatch, useSelector } from "react-redux";
import { bucketActions, bucketSelectors } from "@/store/bucket";
import { Bucket, BucketPatchRequest } from "@/model/bucket";
import uuid from "react-native-uuid";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";

const Home: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch();

  const buckets = useSelector(bucketSelectors.buckets);
  const isLoading = useSelector(bucketSelectors.isLoading);

  const [selectedBucket, setSelectedBucket] = useState<Bucket>(buckets[0]);
  const [newItemId, setNewItemId] = useState<string>("");
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const updatedSelectedBucket = buckets.find(
      (bucket) => bucket._id === selectedBucket._id
    );
    
    if (updatedSelectedBucket) {
      setSelectedBucket(updatedSelectedBucket);
    }
  }, [buckets]);

  const handleUpdateData = (text: string, dataId: string) => {
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
  
    const updatedLocalData = selectedBucket.data.map((item) =>
      item.id === dataId ? { ...item, data: text } : item
    );
  
    setSelectedBucket((prevBucket) => ({
      ...prevBucket,
      data: updatedLocalData,
    }));
  
    const newTimeout = setTimeout(() => {
      const patchRequest: BucketPatchRequest = {
        id: selectedBucket._id,
        data: updatedLocalData,
      };
  
      dispatch(bucketActions.sagaPatchBucketById(patchRequest));
    }, 5000); // 5-second delay
  
    setTypingTimeout(newTimeout);
  };
  

  const handleCheckboxChange = (checked: boolean, dataId: string) => {
    const updatedData = selectedBucket.data.map((item) =>
      item.id === dataId ? { ...item, isChecked: checked } : item
    );
    const patchRequest: BucketPatchRequest = {
      id: selectedBucket._id,
      data: updatedData,
    };

    dispatch(bucketActions.sagaPatchBucketById(patchRequest));
  };

  const handleAddItem = () => {
    const newItemId = `${uuid.v4()}`;

    setNewItemId(newItemId);
    const patchRequest: BucketPatchRequest = {
      id: selectedBucket._id,
      data: [
        ...selectedBucket.data,
        {
          id: newItemId,
          data: "",
          isChecked: false,
        },
      ],
    }

    dispatch(bucketActions.sagaPatchBucketById(patchRequest));
  };

  const handleOpenSettings = () => {
    router.navigate("/(settings)");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => handleOpenSettings()}>
          <MaterialIcons name="menu" size={48} color="#6B68FF" />
        </TouchableOpacity>
        {buckets.map((bucket) => (
          <TouchableOpacity
            key={bucket._id}
            style={
              bucket._id === selectedBucket._id
                ? styles.actionSelected
                : styles.action
            }
            onPress={() => setSelectedBucket(bucket)}
          >
            <Text style={styles.text}>{bucket.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <ScrollView style={styles.listBox}>
        {selectedBucket.data
          .filter((item) => !item.isChecked)
          .map((item) => (
            <View key={item.id} style={styles.listItem}>
              <Checkbox
                value={item.isChecked}
                style={styles.checkbox}
                color={"#D9EF57"}
                onValueChange={(checked) =>
                  handleCheckboxChange(checked, item.id)
                }
              />
              <TextInput
                editable
                style={styles.text}
                autoFocus={item.id === newItemId}
                value={item.data}
                multiline={false}
                autoCapitalize="sentences"
                autoComplete="off"
                autoCorrect={false}
                onChangeText={(text) => handleUpdateData(text, item.id)}
                onSubmitEditing={handleAddItem}
              />
            </View>
          ))}
        {selectedBucket.data.filter((item) => !item.isChecked).length === 0 ||
          (selectedBucket.data.filter((item) => item.isChecked).length > 0 && (
            <View style={styles.separator} />
          ))}
        {selectedBucket.data
          .filter((item) => item.isChecked)
          .map((item) => (
            <View key={item.id} style={styles.listItem}>
              <Checkbox
                value={item.isChecked}
                style={styles.checkbox}
                color={"#D9EF57"}
                onValueChange={(checked) =>
                  handleCheckboxChange(checked, item.id)
                }
              />
              <TextInput
                editable
                style={styles.text}
                autoFocus={item.id === newItemId}
                value={item.data}
                multiline={false}
                autoCapitalize="sentences"
                autoComplete="off"
                autoCorrect={false}
                onChangeText={(text) => handleUpdateData(text, item.id)}
                onSubmitEditing={handleAddItem}
              />
            </View>
          ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: 18,
    gap: 12,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 18,
  },
  action: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    height: 50,
    backgroundColor: "#606771",
    borderColor: "#6B68FF",
    borderStyle: "solid",
    borderWidth: 2,
    borderRadius: 12,
  },
  actionSelected: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    height: 50,
    backgroundColor: "#6B68FF",
    borderColor: "#6B68FF",
    borderStyle: "solid",
    borderWidth: 2,
    borderRadius: 12,
  },
  add: {
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#6B68FF",
    borderRadius: 12,
  },
  listBox: {
    backgroundColor: "#606771",
    paddingHorizontal: 12,
    paddingVertical: 18,
    borderRadius: 20,
    borderBottomRightRadius: 44,
    borderBottomLeftRadius: 44,
    borderColor: "#6B68FF",
    borderStyle: "solid",
    borderWidth: 2,
    flex: 1,
  },
  separator: {
    height: 2,
    backgroundColor: "#6B68FF",
  },
  listItem: {
    flexDirection: "row",
    gap: 12,
    marginVertical: 5,
    alignItems: "center",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderColor: "#D9EF57",
  },
  text: {
    color: "#fffefd",
  },
});

export default Home;
