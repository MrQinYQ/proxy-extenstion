import React from 'react';
import styles from './App.module.less';
import Switch from '../../components/Switch';
// import produce, { Draft } from 'immer';

// const reducer = produce((state: Draft<globalSetting>, action: { type: string, payload?: any }) => {
//   switch (action.type) {
//     case 'globalEnableChange':
//       state.globalEnable = !!action.payload;
//       return 
//     case 'ruleSwitchChange':
//       state.proxys[action.payload!.ruleIndex].enable = action.payload!.val;
//       return 
//     case 'ruleRegChange':
//       state.proxys[action.payload!.ruleIndex].reg = action.payload!.val;
//       return 
//     case 'ruleAddHost': 
//       state.proxys[action.payload].hosts.push({
//         domain: '',
//         ip: '',
//         enable: true
//       })
//       return 
//     case 'ruleSubHost':
//       state.proxys[action.payload!.ruleIndex].hosts.splice(action.payload!.hostIndex, 1);
//       return 
//     case 'hostSwitchChange':
//       state.proxys[action.payload!.ruleIndex].hosts[action.payload!.hostIndex].enable = action.payload!.val;
//       return 
//     case 'addRule':
//       state.proxys.push({
//         enable: true,
//         reg: '',
//         hosts: []
//       })
//       return 
//     case 'delRule':
//       state.proxys.splice(action.payload, 1);
//       return
//     case 'hostDomainChange':
//       state.proxys[action.payload!.ruleIndex].hosts[action.payload!.hostIndex].domain = action.payload!.val;
//       return
//     case 'hostIpChange':
//       state.proxys[action.payload!.ruleIndex].hosts[action.payload!.hostIndex].ip = action.payload!.val;
//       return
//     case 'submit':
//       localStorage.setItem('globalEnable', state.globalEnable ? 'true' : 'false');
//       localStorage.setItem('proxys', JSON.stringify(state.proxys));
//       chrome.extension.getBackgroundPage()?.proxySubmit();
//       return
//     default:
//       throw new Error();
//   }
// })

const reducer: (state: globalSetting, action: {
  type: string;
  payload?: any;
}) => globalSetting = (state: globalSetting, action: { type: string, payload?: any }) => {
  switch (action.type) {
    case 'globalEnableChange':
      return {
        globalEnable: !!action.payload,
        proxys: state.proxys
      }
    case 'ruleSwitchChange':
      return {
        ...state,
        proxys: state.proxys.map((item, index, array) => {
          if (index === action.payload!.ruleIndex) {
            return {
              ...item,
              enable: action.payload!.val
            }
          } else {
            return item;
          }
        })
      }
    case 'ruleRegChange':
      return {
        ...state,
        proxys: state.proxys.map((item, index, array) => {
          if (index === action.payload!.ruleIndex) {
            return {
              ...item,
              reg: action.payload!.val
            }
          } else {
            return item;
          }
        })
      }
    case 'ruleAddHost': 
      return {
        ...state,
        proxys: state.proxys.map((proxy, index, array) => {
          if (index === action.payload) {
            return {
              ...proxy,
              hosts: [...proxy.hosts, {
                domain: '',
                ip: '',
                enable: true
              }]
            }
          } else {
            return proxy
          }
        })
      }
    case 'ruleSubHost':
      return {
        ...state,
        proxys: state.proxys.map((proxy, index, array) => {
          if (index === action.payload!.ruleIndex) {
            return {
              ...proxy,
              hosts: proxy.hosts.filter((host, hostIndex) => {
                return hostIndex !== action.payload!.hostIndex;
              })
            }
          } else {
            return proxy
          }
        })
      }
    case 'hostSwitchChange':
      return {
        ...state,
        proxys: state.proxys.map((proxy, index, array) => {
          if (index === action.payload!.ruleIndex) {
            return {
              ...proxy,
              hosts: proxy.hosts.map((host, hostIndex) => {
                if (hostIndex === action.payload!.hostIndex) {
                  return {
                    ...host,
                    enable: action.payload!.val
                  }
                } else {
                  return host;
                }
              })
            }
          } else {
            return proxy;
          }
        })
      }
    case 'addRule':
      return {
        ...state,
        proxys: [...state.proxys, {
          enable: true,
          reg: '',
          hosts: []
        }]
      }
    case 'delRule':
      return {
        ...state,
        proxys: state.proxys.filter((proxy, ruleIndex) => {
          return ruleIndex !== action.payload
        })
      }
    case 'hostDomainChange':
      return {
        ...state,
        proxys: state.proxys.map((proxy, index, array) => {
          if (index === action.payload!.ruleIndex) {
            return {
              ...proxy,
              hosts: proxy.hosts.map((host, hostIndex) => {
                if (hostIndex === action.payload!.hostIndex) {
                  return {
                    ...host,
                    domain: action.payload!.val
                  }
                } else {
                  return host;
                }
              })
            }
          } else {
            return proxy;
          }
        })
      }
    case 'hostIpChange':
      return {
        ...state,
        proxys: state.proxys.map((proxy, index, array) => {
          if (index === action.payload!.ruleIndex) {
            return {
              ...proxy,
              hosts: proxy.hosts.map((host, hostIndex) => {
                if (hostIndex === action.payload!.hostIndex) {
                  return {
                    ...host,
                    ip: action.payload!.val
                  }
                } else {
                  return host;
                }
              })
            }
          } else {
            return proxy;
          }
        })
      }
    case 'submit':
      localStorage.setItem('globalEnable', state.globalEnable ? 'true' : 'false');
      localStorage.setItem('proxys', JSON.stringify(state.proxys));
      chrome.extension.getBackgroundPage()?.proxySubmit();
      return state;
    default:
      throw new Error();
  }
}

const initialState: globalSetting = {
  globalEnable: false,
  proxys: []
};

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

function Host (props: { hostIndex: number, host: Host, proxyIndex: number, proxy: Rule, dispatch: React.Dispatch<{
  type: string;
  payload?: any;
}> }) {
  const { host, hostIndex, proxyIndex: ruleIndex, dispatch } = props;
  return <div key={hostIndex} className={styles.host}>
  <Switch checked={host.enable} onChange={(val) => dispatch({ type: 'hostSwitchChange', payload: { val, ruleIndex, hostIndex } })} />
  <input key={`input1_${hostIndex}`} placeholder="host: www.google.com" type="text" value={host.domain} onChange={(val) => dispatch({ type: 'hostDomainChange', payload: {val: val.target.value, ruleIndex, hostIndex} })}/>
  <input key={`input2_${hostIndex}`} placeholder="ip: 8.8.8.8" type="text" value={host.ip} onChange={(val) => dispatch({ type: 'hostIpChange', payload: {val: val.target.value, ruleIndex, hostIndex} })}/>
  <button type="button" onClick={() => dispatch({ type: 'ruleSubHost', payload: { ruleIndex, hostIndex } })}>-</button>
</div>
}

function Proxy (props: { proxyIndex: number, proxy: Rule, dispatch: React.Dispatch<{
  type: string;
  payload?: any;
}> }) {
  const { dispatch, proxy: rule, proxyIndex: ruleIndex } = props;
  return <div className={styles.formItem}>
  <div className={styles.reg}>
    <Switch checked={rule.enable} onChange={(val) => dispatch({ type: 'ruleSwitchChange', payload: { val, ruleIndex} })} />
    <input placeholder="生效tab正则：*.google.com，localhost:8080" type="text" value={rule.reg} onChange={(val) => dispatch({ type: 'ruleRegChange', payload: { val: val.target.value, ruleIndex } })} />
  </div>
  <div className={styles.hosts}>
    {
      rule.hosts.map((host, hostIndex) => {
        return <Host key={hostIndex} hostIndex={hostIndex} host={host} proxyIndex={ruleIndex} proxy={rule} dispatch={dispatch} />
      })
    }
    <div className={styles.host}>
      <button type="button" onClick={() => dispatch({ type: 'ruleAddHost', payload: ruleIndex })}>增加host规则</button>
      <button type="button" onClick={() => dispatch({ type: 'delRule', payload: ruleIndex })}>删除代理规则</button>
    </div>
  </div>
</div>
}

function App () {
  const [state, dispatch] = React.useReducer(reducer, initialState, initializer);
  return <div className={styles.App}>
    <form className={styles.form}>
      <div className={styles.formItem}>
        <span>扩展开关：</span>
        <Switch checked={state.globalEnable} onChange={(val) => dispatch({ type: 'globalEnableChange', payload: val })} />
      </div>
      {/* {
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
                    <input key={`input1_${hostIndex}`} placeholder="host: www.google.com" type="text" value={host.domain} onChange={(val) => dispatch({ type: 'hostDomainChange', payload: {val: val.target.value, ruleIndex, hostIndex} })}/>
                    <input key={`input2_${hostIndex}`} placeholder="ip: 8.8.8.8" type="text" value={host.ip} onChange={(val) => dispatch({ type: 'hostIpChange', payload: {val: val.target.value, ruleIndex, hostIndex} })}/>
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
      } */}
      {
        state.proxys.map((rule, ruleIndex, array) => {
          return <Proxy proxy={rule} proxyIndex={ruleIndex} dispatch={dispatch} />
        })
      }
      <div className={styles.formItem}>
        <button type="button" onClick={() => dispatch({ type: 'addRule' })}>增加代理规则</button>
      </div>
      <div className={styles.formItem}>
        <button style={{ backgroundColor: '#1890ff', color: '#ffffff' }} type="button" onClick={() => dispatch({ type: 'submit' })}>保存生效</button>
      </div>
    </form>
  </div>
}

export default App;
