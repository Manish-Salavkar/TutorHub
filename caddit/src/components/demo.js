import React, {useState} from "react";
import { Snackbar } from "@material-ui/core";

const Demo = () => {
    const [message, setMessage] = useState(true);

    return (
        <div>
            <Snackbar
            open={message}
            message="Hello"
            />
        </div>
    )
}

export default Demo