import { Box } from "@mui/material";
import style from "./styleHomePage";

import Header from "./Header";
import CatalogActionBar from "./CatalogActionBar";
import CatalogItemList from "./CatalogItemList";
import { useState } from "react";
import { Bucket } from "@/model/bucket";
import { useSelector } from "react-redux";
import { bucketSelectors } from "@/store/bucket";

const EventsPage = (): JSX.Element => {
  const selectedCatalog = useSelector(bucketSelectors.selectedBucket);

  const [draftCatalog, setDraftCatalog] = useState<Bucket | undefined>(
    selectedCatalog
  );

  return (
    <Box sx={style.container}>
      <Header draftCatalog={draftCatalog} />
      <Box sx={style.content}>
        <CatalogActionBar />
        <CatalogItemList
          draftCatalog={draftCatalog}
          setDraftCatalog={setDraftCatalog}
        />
      </Box>
    </Box>
  );
};

export default EventsPage;
