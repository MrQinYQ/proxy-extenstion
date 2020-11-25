declare interface Host {
    enable: boolean;
    domain: string;
    ip: string;
}

declare interface Rule {
    enable: boolean;
    reg: string;
    hosts: Host[];
}

declare interface globalSetting {
    globalEnable: boolean;
    proxys: Rule[];
}