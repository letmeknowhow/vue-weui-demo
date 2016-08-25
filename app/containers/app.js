import React, { Component } from 'react';
import {Scene, Router, TabBar, Schema, Actions} from 'react-native-mobx';
import { Navigator, StyleSheet, Platform, Image, Alert, BackAndroid, Dimensions } from 'react-native';
import { Container, Header, Title, Content, Text, Button, Icon, List, ListItem, View } from 'native-base';

import codePush from 'react-native-code-push';

import Modal from 'react-native-modalbox';
import theme from '../themes/base-theme';
import * as Progress from 'react-native-progress';
//model
import CTSAppStore from '../model';


//侧边菜单
import Drawer from './Drawer';

/** 主tab 四页*/
import Home from '../components/home/Home';
import Financial from '../components/financial/Container';
import Order from '../components/order/Container';
import Mine from '../components/mine/Container';

import ProductDetail from '../components/product/ProductDetail';

//账户总览
import AccountSummary from '../components/account/AccountSummary';
import DemandDepositSearch from '../components/account/DemandDepositSearch';
import FixedDepositSearch from '../components/account/FixedDepositSearch';
import MoneyTransfer from '../components/account/MoneyTransfer';

//定期转活期
import Demand2Fixed from '../components/account/Demand2Fixed';
//缴费
import Payment from '../components/Payment';
import PaymentSearch from '../components/PaymentSearch';

const height = Dimensions.get('window').height;
const styles = StyleSheet.create({
  tabBarStyle: {
    backgroundColor: '#eee',
  },
  tabBarSelectedItemStyle: {
    backgroundColor: '#ddd',
  },
  modal: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  modal1: {
    height: 300
  },
  modal2: {
    height,
    position: 'relative',
    justifyContent: 'center',
  },
  progress: {
    margin: 10
  }
});
const TAB_TITLE_HOME = '首页';
const TAB_TITLE_FINANCIAL = '理财';
const TAB_TITLE_ORDER = '出行';
const TAB_TITLE_MINE = '我的';

if (Platform.OS === 'android') {
  BackAndroid.addEventListener('hardwareBackPress', () => {
    if (!Actions.pop()) {
      Alert.alert('提示', '确定要退出应用吗?',
        [
          {text: '取消'},
          {text: '退出', onPress: () => BackAndroid.exitApp()}
        ]
      );
    }
    return true; // 返回true,不退出程序
  });
}

class TabIcon extends React.Component {

  render() {
    let uri;
    switch (this.props.title) {
      case TAB_TITLE_HOME:
        uri = require('../../assets/icons/Home.png');
        break;
      case TAB_TITLE_FINANCIAL:
        uri = require('../../assets/icons/financial.png');
        break;
      case TAB_TITLE_ORDER:
        uri = require('../../assets/icons/Order.png');
        break;
      default:
        uri = require('../../assets/icons/Mine.png');
    }
    return (
      <View style={{alignItems: 'center'}}>
        <Image source={uri} style={{width: 25, height: 25, tintColor: this.props.selected ? '#2897EC' : null}}/>
        <Text
          style={{color: this.props.selected ? '#2897EC' : 'black', fontSize: 12, marginTop: 3}}>{this.props.title}</Text>
      </View>
    );
  }
}

class Application extends Component {

  constructor(props) {
    super(props);
    // 初始状态
    this.state = {
      showDownloadingModal: false,
      showInstalling: false,
      downloadProgress: 0
    };
  }

  componentDidMount() {
    codePush.sync(
      {
        updateDialog: {
          title: '升级提醒',
          optionalUpdateMessage: '有一个可用的更新 是否需要安装?',
          optionalInstallButtonLabel: '马上更新',
          optionalIgnoreButtonLabel: '暂不更新'
        },
        installMode: codePush.InstallMode.IMMEDIATE
      },
      (status) => {
        switch (status) {
          case codePush.SyncStatus.DOWNLOADING_PACKAGE:
            this.setState({showDownloadingModal: true});
            this.refs.modal.open();
            break;
          case codePush.SyncStatus.INSTALLING_UPDATE:
            this.setState({showInstalling: true});
            break;
          case codePush.SyncStatus.UPDATE_INSTALLED:
            this.refs.modal.close();
            this.setState({showDownloadingModal: false});
            break;
          default:
            break;
        }
      },
      ({ receivedBytes, totalBytes, }) => {
        this.setState({downloadProgress: receivedBytes / totalBytes * 100});
      }
    );
  }

  render() {
    if (this.state.showDownloadingModal) {
      return (
        <Container theme={theme} style={{backgroundColor: theme.defaultBackgroundColor}}>
          <Content style={styles.container}>
            <Modal style={[styles.modal, styles.modal2]} backdrop={false} ref={"modal"} swipeToClose={false}>
              <View style={{flex: 1, alignSelf: 'stretch', justifyContent: 'center', padding: 20}}>
                {this.state.showInstalling ?
                  <Text style={{color: theme.brandPrimary, textAlign: 'center', marginBottom: 15, fontSize: 15 }}>
                    正在安装更新包...
                  </Text> :
                  <View style={{flex: 1, alignSelf: 'stretch', alignItems: 'center', justifyContent: 'center', padding: 20}}>
                    <Text style={{color: theme.brandPrimary, textAlign: 'center', marginBottom: 15, fontSize: 15 }}>下载更新包...</Text>
                    <Progress.Circle
                      style={styles.progress}
                      size={80}
                      showsText={true}
                      progress={parseInt(this.state.downloadProgress, 10) / 100}
                    />
                  </View>
                }
              </View>
            </Modal>
          </Content>
        </Container>

      );
    } else {
      return (
        <View style={{flex: 1}}>
          <Router hideNavBar={true} store={CTSAppStore} sceneStyle={{backgroundColor: '#F7F7F7'}}>
            <Scene key="root" hideNavBar={true}>
              <Scene key="productDetail" component={ProductDetail}/>
              <Scene key="accountSummary" component={AccountSummary} title="账户查询"/>
              <Scene key="demandDepositSearch" component={DemandDepositSearch}/>
              <Scene key="fixedDepositSearch" component={FixedDepositSearch}/>
              <Scene key="moneyTransfer" component={MoneyTransfer}/>
              <Scene key="demand2Fixed" component={Demand2Fixed}/>
              <Scene key="payment" component={Payment}/>
              <Scene key="paymentSearch" component={PaymentSearch}/>
              <Scene key="drawer" component={Drawer} sceneStore={CTSAppStore} initial={true}>
                <Scene
                  key="tabBar"
                  tabs
                  default="home"
                  tabBarStyle={styles.tabBarStyle}
                  tabBarSelectedItemStyle={styles.tabBarSelectedItemStyle}
                >
                  <Scene key="home" schema="tab" initial={true} component={Home} title={TAB_TITLE_HOME}
                         hideNavBar={true}
                         icon={TabIcon}/>
                  <Scene key="financial" schema="tab" component={Financial} title={TAB_TITLE_FINANCIAL}
                         hideNavBar={true}
                         icon={TabIcon}/>
                  <Scene key="order" schema="tab" component={Order} title={TAB_TITLE_ORDER} hideNavBar={true}
                         icon={TabIcon}/>
                  <Scene key="mine" schema="tab" component={Mine} title={TAB_TITLE_MINE} hideNavBar={true}
                         icon={TabIcon}/>
                </Scene>
              </Scene>
            </Scene>
          </Router>
        </View>
      );
    }
  }

  //animate() {
  //  let downloadProgress = 0;
  //  this.setState({ downloadProgress });
  //  setTimeout(() => {
  //    setInterval(() => {
  //      downloadProgress += 5;
  //      if (downloadProgress > 100) {
  //        downloadProgress = 100;
  //      }
  //      this.setState({ downloadProgress });
  //    }, 500);
  //  }, 1500);
  //}
}
export default Application;