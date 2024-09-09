import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Icon, ListItem } from "@rneui/themed";
import { useDispatch, useSelector } from "react-redux";
import { bucketActions, bucketSelectors } from "@/store/bucket";
import { Text, TextInput } from "react-native";
import { BucketCreateRequest, BucketPatchRequest } from "@/model/bucket";
import uuid from "react-native-uuid";

const SettingsModal: React.FC = () => {
  const dispatch = useDispatch();
  const buckets = useSelector(bucketSelectors.buckets);

  const [expanded, setExpanded] = useState(false);
  const [labelInput, setLabelInput] = useState<{ [key: string]: string }>({});

  const handleCreateBucket = () => {
    const request: BucketCreateRequest = {
      label: "New bucket",
      data: [
        {
          id: `${uuid.v4()}`,
          data: "",
          isChecked: false,
        },
      ],
    };
    dispatch(bucketActions.sagaCreateBucket(request));
  };

  const handleUpdateLabel = (label: string, bucketId: string) => {
    if (label.trim() === "") {
      handleDeleteBucket(bucketId);
    } else {
      const patchRequest: BucketPatchRequest = {
        id: bucketId,
        label,
      };
      dispatch(bucketActions.sagaPatchBucketById(patchRequest));
    }
  };

  const handleDeleteBucket = (bucketId: string) => {
    dispatch(bucketActions.sagaDeleteBucketById(bucketId));
  };

  const handleLabelChange = (bucketId: string, label: string) => {
    setLabelInput((prevState) => ({ ...prevState, [bucketId]: label }));
  };

  return (
    <SafeAreaView>
      <ListItem bottomDivider>
        <Icon name="account" type="material-community" color="#6B68FF" />
        <ListItem.Content>
          <ListItem.Title>Account</ListItem.Title>
        </ListItem.Content>
      </ListItem>
      <ListItem.Accordion
        content={
          <>
            <Icon
              name="bucket"
              type="material-community"
              color="#6B68FF"
              style={{ marginRight: 15 }}
            />
            <ListItem.Content>
              <ListItem.Title>Buckets</ListItem.Title>
            </ListItem.Content>
          </>
        }
        isExpanded={expanded}
        onPress={() => {
          setExpanded(!expanded);
        }}
      >
        {buckets.map((bucket) => (
          <ListItem.Swipeable
            key={bucket._id}
            bottomDivider
            leftWidth={100}
            leftContent={() => (
              <Button
                containerStyle={{
                  flex: 1,
                  justifyContent: "center",
                  backgroundColor: "#f4f4f4",
                }}
                type="clear"
                icon={{ name: "delete" }}
                onPress={() => handleDeleteBucket(bucket._id)}
              />
            )}
          >
            <ListItem.Content>
              <TextInput
                value={
                  labelInput[bucket._id] !== undefined
                    ? labelInput[bucket._id]
                    : bucket.label
                }
                style={{ flex: 1 }}
                placeholder="Enter new bucket name"
                onChangeText={(text) => handleLabelChange(bucket._id, text)}
                onSubmitEditing={() =>
                  handleUpdateLabel(labelInput[bucket._id] || "", bucket._id)
                }
              />
            </ListItem.Content>
            <ListItem.Chevron />
          </ListItem.Swipeable>
        ))}
        <ListItem>
          <Button
            containerStyle={{
              flex: 1,
              justifyContent: "center",
            }}
            type="clear"
            onPress={handleCreateBucket}
          >
            <Text>Add new bucket</Text>
          </Button>
        </ListItem>
      </ListItem.Accordion>
    </SafeAreaView>
  );
};

export default SettingsModal;
