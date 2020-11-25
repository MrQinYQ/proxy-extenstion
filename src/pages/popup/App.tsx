import React from 'react';
import './App.css';
import Switch from '../../components/Switch';

const initialState: globalSetting = {
  globalEnable: false,
  proxys: []
};

function reducer(state: globalSetting, action: { type: string, payload?: any }) {
  switch (action.type) {
    case 'globalEnableChange':
      return {
        globalEnable: !!action.payload,
        proxys: state.proxys
      };
    case 'ruleSwitchChange':
      state.proxys[action.payload!.ruleIndex].enable = action.payload!.val;
      return state;
    case 'ruleRegChange':
      state.proxys[action.payload!.ruleIndex].reg = action.payload!.val;
      return state;
    case 'ruleAddHost': 
      state.proxys[action.payload].hosts.push({
        domain: '',
        ip: '',
        enable: true
      })
      return state;
    case 'ruleSubHost':
      state.proxys[action.payload!.ruleIndex].hosts.splice(action.payload!.hostIndex, 1);
      return state;
    case 'hostSwitchChange':
      state.proxys[action.payload!.ruleIndex].hosts[action.payload!.hostIndex].enable = action.payload!.val;
      return state;
    case 'addRule':
      state.proxys.push({
        enable: true,
        reg: '',
        hosts: []
      })
      return state;
    case 'hostDomainChange':
      state.proxys[action.payload!.ruleIndex].hosts[action.payload!.hostIndex].domain = action.payload!.val;
      return state;
    case 'hostIpChange':
      state.proxys[action.payload!.ruleIndex].hosts[action.payload!.hostIndex].ip = action.payload!.val;
      return state;
    case 'submit':
      localStorage.setItem('globalEnable', state.globalEnable ? 'true' : 'false');
      localStorage.setItem('proxys', JSON.stringify(state.proxys));
      const bgp: any = chrome.extension.getBackgroundPage();
      if (bgp) {
        bgp.proxySubmit?.()
      }
      return state;
    default:
      throw new Error();
  }
}

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

function Form () {
  const [state, dispatch] = React.useReducer(reducer, initialState, initializer);
  return <form className="form">
    <div className="form-item">
      <Switch checked={state.globalEnable} onChange={(val) => dispatch({ type: 'globalEnableChange', payload: val })} />
    </div>
    {
      state.proxys.map((rule, ruleIndex) => {
        return <div className="form-item">
          <div className="reg">
            <Switch checked={rule.enable} onChange={(val) => dispatch({ type: 'ruleSwitchChange', payload: { val, ruleIndex} })} />
            <input value={rule.reg} onChange={(val) => dispatch({ type: 'ruleRegChange', payload: { val, ruleIndex } })} />
          </div>
          <div className="hosts">
            {
              rule.hosts.map((host, hostIndex) => {
                return <div className="host">
                  <Switch checked={host.enable} onChange={(val) => dispatch({ type: 'hostSwitchChange', payload: { val, ruleIndex, hostIndex } })} />
                  <input value={host.domain} onChange={(val) => dispatch({ type: 'hostDomainChange', payload: {val, ruleIndex, hostIndex} })}/>
                  <input value={host.ip} onChange={(val) => dispatch({ type: 'hostIpChange', payload: {val, ruleIndex, hostIndex} })} />
                  <button type="button" onClick={() => dispatch({ type: 'ruleSubHost', payload: { ruleIndex, hostIndex } })}>-</button>
                </div>
              })
            }
            <button type="button" onClick={() => dispatch({ type: 'ruleAddHost', payload: ruleIndex })}>增加host规则</button>
          </div>
        </div>
      })
    }
    <div className="form-item">
      <button type="button" onClick={() => dispatch({ type: 'addRule' })}>增加代理规则</button>
    </div>
    <div className="form-item">
      <button type="button" onClick={() => dispatch({ type: 'submit' })}>保存生效</button>
    </div>
  </form>
}

function App() {
  return (
    <div className="App">
      <Form />
    </div>
  );
}

export default App;
