import React from 'react';
import styles from './App.module.less';
import Switch from '../../components/Switch';
import produce, { Draft } from 'immer';

const initialState: globalSetting = {
  globalEnable: false,
  proxys: []
};

const reducer = produce((state: Draft<globalSetting>, action: { type: string, payload?: any }) => {
  switch (action.type) {
    case 'globalEnableChange':
      state.globalEnable = !!action.payload;
      return 
    case 'ruleSwitchChange':
      state.proxys[action.payload!.ruleIndex].enable = action.payload!.val;
      return 
    case 'ruleRegChange':
      state.proxys[action.payload!.ruleIndex].reg = action.payload!.val;
      return 
    case 'ruleAddHost': 
      state.proxys[action.payload].hosts.push({
        domain: '',
        ip: '',
        enable: true
      })
      return 
    case 'ruleSubHost':
      state.proxys[action.payload!.ruleIndex].hosts.splice(action.payload!.hostIndex, 1);
      return 
    case 'hostSwitchChange':
      state.proxys[action.payload!.ruleIndex].hosts[action.payload!.hostIndex].enable = action.payload!.val;
      return 
    case 'addRule':
      state.proxys.push({
        enable: true,
        reg: '',
        hosts: []
      })
      return 
      // 如下代码有问题，state is immutable 具体原因有待排查(reducer函数可能执行多次？)
      // state.proxys = [...state.proxys, {
      //   enable: true,
      //   reg: '',
      //   hosts: []
      // }]
      // return {
      //   globalEnable: state.globalEnable,
      //   proxys: state.proxys
      // };
      // 如下是不使用immer正确的写法
      // const newProxys = [...state.proxys, {
      //   enable: true,
      //   reg: '',
      //   hosts: []
      // }]
      // return {
      //   globalEnable: state.globalEnable,
      //   proxys: newProxys
      // };
    case 'delRule':
      state.proxys.splice(action.payload, 1);
      return
    case 'hostDomainChange':
      state.proxys[action.payload!.ruleIndex].hosts[action.payload!.hostIndex].domain = action.payload!.val;
      return
    case 'hostIpChange':
      state.proxys[action.payload!.ruleIndex].hosts[action.payload!.hostIndex].ip = action.payload!.val;
      return
    case 'submit':
      localStorage.setItem('globalEnable', state.globalEnable ? 'true' : 'false');
      localStorage.setItem('proxys', JSON.stringify(state.proxys));
      const bgp = chrome.extension.getBackgroundPage();
      if (bgp) {
        bgp.proxySubmit();
      }
      return
    default:
      throw new Error();
  }
})

function initializer() {
  const proxyStr = localStorage.getItem('proxys');
  let proxys: Rule[] = [];
  if (proxyStr) {
    proxys = JSON.parse(proxyStr);
  }
  const globalEnableStr = localStorage.getItem('globalEnable');
  let globalEnable: boolean = false;
  if (globalEnableStr && globalEnableStr === 'true') {
    globalEnable = true;
  }
  return {
    globalEnable,
    proxys
  }
}

function App () {
  const [state, dispatch] = React.useReducer(reducer, initialState, initializer);
  return <div className={styles.App}>
    <form className={styles.form}>
      <div key="global" className={styles.formItem}>
        <span>扩展开关：</span>
        <Switch checked={state.globalEnable} onChange={(val) => dispatch({ type: 'globalEnableChange', payload: val })} />
      </div>
      {
        state.proxys.map((rule, ruleIndex, array) => {
          return <div key={ruleIndex} className={styles.formItem}>
            <div className={styles.reg}>
              <Switch checked={rule.enable} onChange={(val) => dispatch({ type: 'ruleSwitchChange', payload: { val, ruleIndex} })} />
              <input placeholder="生效tab正则：*.google.com，localhost:8080" type="text" value={rule.reg} onChange={(val) => dispatch({ type: 'ruleRegChange', payload: { val: val.target.value, ruleIndex } })} />
            </div>
            <div className={styles.hosts}>
              {
                rule.hosts.map((host, hostIndex) => {
                  return <div key={hostIndex} className={styles.host}>
                    <Switch checked={host.enable} onChange={(val) => dispatch({ type: 'hostSwitchChange', payload: { val, ruleIndex, hostIndex } })} />
                    <input key="domain" placeholder="host: www.google.com" type="text" value={host.domain} onChange={(val) => dispatch({ type: 'hostDomainChange', payload: {val: val.target.value, ruleIndex, hostIndex} })}/>
                    <input key="ip" placeholder="ip: 8.8.8.8" type="text" value={host.ip} onChange={(val) => dispatch({ type: 'hostIpChange', payload: {val: val.target.value, ruleIndex, hostIndex} })} />
                    <button type="button" onClick={() => dispatch({ type: 'ruleSubHost', payload: { ruleIndex, hostIndex } })}>-</button>
                  </div>
                })
              }
              <div className={styles.host}>
                <button type="button" onClick={() => dispatch({ type: 'ruleAddHost', payload: ruleIndex })}>增加host规则</button>
                <button type="button" onClick={() => dispatch({ type: 'delRule', payload: ruleIndex })}>删除代理规则</button>
              </div>
            </div>
          </div>
        })
      }
      <div key="add" className={styles.formItem}>
        <button type="button" onClick={() => dispatch({ type: 'addRule' })}>增加代理规则</button>
      </div>
      <div key="submit" className={styles.formItem}>
        <button style={{ backgroundColor: '#1890ff', color: '#ffffff' }} type="button" onClick={() => dispatch({ type: 'submit' })}>保存生效</button>
      </div>
    </form>
  </div>
}

export default App;
