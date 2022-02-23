import { HubConnectionBuilder } from "@microsoft/signalr";
import GoogleMapReact from "google-map-react";
import React, { useEffect, useState } from "react";
import { FaCar, FaUser } from "react-icons/fa";
import "./App.css";

const Car = ({ text }) => (
  <div>
    {text}
    <FaCar size={30} />
  </div>
);
const Person = ({ text }) => (
  <div>
    {text}
    <FaUser size={30} />
  </div>
);

function App() {
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
      //.withUrl("https://localhost:44339/hubs/stream")
      .withUrl("https://fastaride-pubsub.herokuapp.com/hubs/stream")
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

          connection.stream("RiderStream", latLng[0], latLng[1]).subscribe({
            next: (item) => {
              handleUpdate(item);
            },
            complete: () => {
              console.log("completed");
            },
            error: (err) => {
              console.log(`error ${err}`);
            },
          });
        })
        //   connection
        //     .stream("GetSomeDataWithAsyncStreams", latLng[0], latLng[1], 500)
        //     .subscribe({
        //       next: (item) => {
        //         //var newData = [...data, item];
        //         setData(item);
        //         console.log(item);
        //       },
        //       complete: () => {
        //         console.log("completed");
        //       },
        //       error: (err) => {
        //         console.log("error");
        //       },
        //     });
        // })
        .catch((e) => console.log("Connection failed: ", e));
    }
  }, [connection, latLng]);

  const handleUpdate = (item) => {
    console.log(item);
    setData((data) => {
      if (data.length > 0) {
        if (item[0].updateStatus === 1) {
          console.log(item);
          return data.filter(
            (element) => element.driverId !== item[0].driverId
          );
        } else {
          var temp = data.filter(
            (element) => element.driverId !== item[0].driverId
          );
          return temp.concat(item);
        }
      } else {
        setData(item);
      }
    });
  };

  const handleWalk = () => {
    var lat = latLng[0];
    var lng = latLng[1];
    connection.stop();
    setLatLng([lat + 0.00002, lng + 0.0003]);
  };

  return (
    <div className="App">
      <h1>PubSub.Client</h1>
      {/* <table>
        <tbody>
          {data &&
            data.map((item, i) => (
              <tr rowspace={3}>
                <tr>
                  <td>Driver</td>
                  <td>{item?.id}</td>
                </tr>
                <tr>
                  <td>Name</td>
                  <td>{item?.name}</td>
                </tr>
                <tr>
                  <td>Latitude</td>
                  <td>{item?.latitude}</td>
                </tr>
                <tr>
                  <td>Longitude</td>
                  <td>{item?.longitude}</td>
                </tr>
              </tr>
            ))}
        </tbody>
      </table> */}

      <button onClick={handleWalk}>Walk</button>
      <div style={{ height: "100vh", width: "100%" }}>
        <GoogleMapReact
          bootstrapURLKeys={{ key: "" }}
          defaultCenter={center}
          defaultZoom={15}
        >
          {latLng && <Person lat={latLng[0]} lng={latLng[1]} text={"User"} />}
          {data &&
            data.map((item, i) => (
              <Car
                lat={item?.latitude}
                lng={item?.longitude}
                text={item?.name}
                key={i}
              />
            ))}
        </GoogleMapReact>
      </div>
    </div>
  );
}

export default App;
