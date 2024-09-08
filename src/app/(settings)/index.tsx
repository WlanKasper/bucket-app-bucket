import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Icon, ListItem } from "@rneui/themed";
import { useSelector } from "react-redux";
import { bucketSelectors } from "@/store/bucket";
import { Text } from "react-native";

const SettingsModal: React.FC = () => {
  const [expanded, setExpanded] = useState(false);

  const buckets = useSelector(bucketSelectors.buckets);

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
            leftContent={(action) => (
              <Button
                containerStyle={{
                  flex: 1,
                  justifyContent: "center",
                  backgroundColor: "#f4f4f4",
                }}
                type="clear"
                icon={{ name: "delete-outline" }}
                onPress={action}
              />
            )}
          >
            <ListItem.Content>
              <ListItem.Title>{bucket.label}</ListItem.Title>
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
          >
            <Text>Add new bucket</Text>
          </Button>
        </ListItem>
      </ListItem.Accordion>
    </SafeAreaView>
  );
};

export default SettingsModal;
