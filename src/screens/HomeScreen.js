import React, {useState, useEffect} from 'react';
import {
  ScrollView,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import FastImage from "react-native-fast-image";
import { connect } from "react-redux";
import {
  AppIcon,
  AppStyles,
} from "../AppStyles";
import { Configuration } from "../Configuration";

import firestore from '@react-native-firebase/firestore';

import {Appbar, TextInput, Button, List} from 'react-native-paper';


function Todo({ id, title, complete }) {
  async function toggleComplete() {
    await firestore()
      .collection('todos')
      .doc(id)
      .update({
        complete: !complete,
      });
  }

  return (
    <List.Item
      title={title}
      onPress={() => toggleComplete()}
      left={props => (
        <List.Icon {...props} icon={complete ? 'check' : 'cancel'} />
      )}
    />
  );
}


function Todos() {
  const [ todo, setTodo ] = useState('');
  const ref = firestore().collection('todos');  
  const [ loading, setLoading ] = useState(true);
  const [ todos, setTodos ] = useState([]);

  useEffect(() => {
    return ref.onSnapshot(querySnapshot => {
      const list = [];
      querySnapshot.forEach(doc => {
        const { title, complete } = doc.data();
        list.push({
          id: doc.id,
          title,
          complete,
        });
      });

      setTodos(list);

      if (loading) {
        setLoading(false);
      }
    });
  }, []);

  async function addTodo() {
    await ref.add({
      title: todo,
      complete: false,
    });
    setTodo('');
  }

  return (
    <>
      <Appbar>
        <Appbar.Content title={"TODO's"} />
      </Appbar>
      <FlatList 
        style={{flex: 1}}
        data={todos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <Todo {...item} />}
      />
       <TextInput label={'New Todo'} value={todo} onChangeText={setTodo} />
      <Button onPress={() => addTodo()}>Add TODO</Button>
      
    </>
  );
}


class HomeScreen extends React.Component {
  static navigationOptions = ({ navigation }) => ({
    title: "Home",
    headerLeft: () => {
      return (
        <TouchableOpacity
          onPress={() => {
            navigation.openDrawer();
          }}
        >
          {navigation.state.params && navigation.state.params.menuIcon ? (
            <FastImage
              style={styles.userPhoto}
              resizeMode={FastImage.resizeMode.cover}
              source={{ uri: navigation.state.params.menuIcon }}
            />
          ) : (
            <FastImage
              style={styles.userPhoto}
              resizeMode={FastImage.resizeMode.cover}
              source={AppIcon.images.defaultUser}
            />
          )}
        </TouchableOpacity>
      );
    }
  });

  constructor(props) {
    super(props);
    this.state = {
      activeSlide: 0,
    };
  }

  componentDidMount() {
    this.props.navigation.setParams({
      menuIcon: this.props.user.profileURL
    });
  }

  render() {
    return (
      <React.Fragment>
        <Todos />
       </React.Fragment>
/*       <ScrollView style={styles.container}>
        <Text style={styles.title}>Welcome {this.props.user.email}</Text>
      </ScrollView> */
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    flex: 1,
    padding: Configuration.home.listing_item.offset
  },
  title: {
    fontFamily: AppStyles.fontName.bold,
    fontWeight: "bold",
    color: AppStyles.color.title,
    fontSize: 25
  },
  userPhoto: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginLeft: 5
  }
});

const mapStateToProps = state => ({
  user: state.auth.user
});

export default connect(mapStateToProps)(HomeScreen);
