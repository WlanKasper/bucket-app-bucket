// src/components/SafeAreaWrapper.tsx
import { useSafeAreaInsets } from "@/helpers/telegram/utils";
import { Box } from "@mui/material";
import { ReactNode } from "react";

const SafeAreaWrapper = ({ children }: { children: ReactNode }) => {
  const insets = useSafeAreaInsets();

  return (
    <Box
      sx={{
        pt: `${insets.top}px`,
        pb: `${insets.bottom}px`,
        pl: `${insets.left}px`,
        pr: `${insets.right}px`,
        height: "100vh",
        overflow: "hidden",
        boxSizing: "border-box",
      }}
    >
      {children}
    </Box>
  );
};

export default SafeAreaWrapper;
