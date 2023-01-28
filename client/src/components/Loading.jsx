import { Box, CircularProgress } from "@mui/material";
import React from "react";

const Loading = ({mtValue, justifyContentValue, alignItemsValue}) => {
    return(
        <Box sx={{width:"100%", height:"100%",  display: 'flex' , justifyContent: justifyContentValue, alignItems:alignItemsValue, mt: mtValue }}>
            <CircularProgress />
        </Box>
    )

}

export default Loading;