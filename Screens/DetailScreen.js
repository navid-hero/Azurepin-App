import React from 'react';
import MapboxGL from "@mapbox/react-native-mapbox-gl";
import {Image, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import Api from '../Components/Api';
const api = new Api();
const accessToken = "pk.eyJ1Ijoibmhlcm8iLCJhIjoiY2syZnMya2l1MGFrejNkbGhlczI1cjlnMCJ9.9QUBMhEvbP2RSkNfsjoQeA";
MapboxGL.setAccessToken(accessToken);

export default class DetailScreen extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            mapCenter: {lng: this.props.navigation.getParam('lng'), lat: this.props.navigation.getParam('lat')},
            mapZoomLevel: 13,
            coordinate: {id: "1", lng: this.props.navigation.getParam('lng'), lat: this.props.navigation.getParam('lat')},
            location: ""
        };
    }

    componentDidMount() {
        MapboxGL.setTelemetryEnabled(false);

        api.getLocationName(this.state.coordinate.lat, this.state.coordinate.lng).then(response => {
            this.setState({location: response});
        });
    }

    render() {
        return (
            <View style={styles.page}>
                <View style={styles.container}>
                    <MapboxGL.MapView
                        style={styles.map}
                        logoEnabled={false}
                        zoomLevel={this.state.mapZoomLevel}
                        centerCoordinate={[this.state.mapCenter.lng, this.state.mapCenter.lat]}
                    >
                        <MapboxGL.PointAnnotation id={this.state.coordinate.id}
                                                  coordinate={[this.state.coordinate.lng, this.state.coordinate.lat]} />
                    </MapboxGL.MapView>
                    <View style={styles.locationText}>
                        <Image source={require('../assets/images/Location.png')}
                               style={{ height: 37, width: 37 }} />
                        <Text style={{color: '#707070', padding: 3}}>{this.state.location}</Text>
                    </View>
                </View>
                <View>
                    <TouchableOpacity onPress={() => {this.props.navigation.goBack();}}>
                        <Image source={require('../assets/images/Rectangle-64.png')}
                               style={{ height: 10, width: 150, borderRadius: 5, marginTop: 5 }} />
                    </TouchableOpacity>
                </View>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    page: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F5FCFF"
    },
    container: {
        height: '90%',
        width: '95%',
        backgroundColor: "#C1C1C1",
        borderWidth: 3,
        borderRadius: 10,
        borderColor: "#C1C1C1",
    },
    map: {
        flex: 1
    },
    locationText: {
        flexDirection: 'row',
        alignItems: 'center',
        position: 'absolute',
        top: 30,
        // width: 200,
        left: 25,
        right: 25,
        textAlign: 'left',
        backgroundColor: '#DCDCDC',
        borderRadius: 50,
        padding: 2
    }
});