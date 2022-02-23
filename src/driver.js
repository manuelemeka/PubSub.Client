import { HubConnectionBuilder, Subject } from "@microsoft/signalr";
import React, { useEffect, useState } from "react";
import "./App.css";

const DriverUpdate = () => {
  const [connection, setConnection] = useState(undefined);
  const [data, setData] = useState([]);
  const [first, setFirst] = useState(true);
  const [latLng, setLatLng] = useState([7.329, 9.123]);
  const [center, setCenter] = useState({
    lat: latLng[0],
    lng: latLng[1],
  });

  useEffect(() => {
    const newConnection = new HubConnectionBuilder()
      .withUrl("https://localhost:44339/hubs/uploadstream")
      //.withUrl("https://fastaride-pubsub.herokuapp.com/hubs/uploadstream")
      .withAutomaticReconnect()
      .build();

    setConnection(newConnection);
  }, []);

  useEffect(() => {
    if (connection) {
      connection
        .start()
        .then((result) => {
          console.log("Connected!");
          const subject = new Subject();
          connection.send("RiderUpdateStream", subject).then(() => {
            var iteration = 0;
            var driver = {
              driverId: 0,
              name: "Emeka",
              photo: "string",
              latitude: 7.332,
              longitude: 9.123,
              bearing: 0.2,
              driverStatus: 1,
            };
            const intervalHandle = setInterval(() => {
              iteration++;
              driver.latitude += 0.0008;
              driver.longitude += 0.0008;
              subject.next(driver);
              console.log("updated");
              if (iteration === 10) {
                clearInterval(intervalHandle);
                subject.complete();
              }
            }, 5000);
          });
        })
        .catch((e) => console.log("Connection failed: ", e));
    }
  }, [connection, latLng]);

  const handleUpdate = () => {};

  return <div>Updating drivers</div>;
};

export default DriverUpdate;
