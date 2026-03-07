// ==UserScript==
// @name         $ADDON$
// @namespace    http://tampermonkey.net/
// @version      2025-03-05
// @description  try to take over the world!
// @author       You
// @match        *://*.margonem.pl/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        unsafeWindow
// @grant        GM_xmlhttpRequest
// @connect      margonem.pl
// @icon         none


// 
function logComand(c, color) {
    console.log(`%c${c}`, `color: ${color}; font-weight: bold;`);
}



function loadScript() {

    if (window.top !== window.self) return;

    unsafeWindow.GM_setValue = GM_setValue;
    unsafeWindow.GM_getValue = GM_getValue;

    let reloadBlocked = false;

    function isGameWorldPage() {
        const url = location.href;
        return url.includes('.margonem.pl/') && !url.includes('www.margonem.pl');
    }

    if (isGameWorldPage()) {
        unsafeWindow.hasInterfaceCookie = getCookie('interface');
    }

    function reloadSite() {
        if (!reloadBlocked && isGameWorldPage()) {
            location.reload();
        }
        reloadBlocked = true;
    }

    if (!unsafeWindow.hasInterfaceCookie) {
        reloadSite();
        logComand(`Nie wykryto interfejsu, reload strony`, 'RED');
    }

    logComand(`[Interfejs] ${unsafeWindow.hasInterfaceCookie}`, '#b518d3');

    function initGame() {
        return new Promise(resolve => {

            const check = () => {

                if (
                    unsafeWindow.hasInterfaceCookie === 'si' &&
                    unsafeWindow.g &&
                    unsafeWindow.g.init >= 1
                ) {
                    resolve();
                    return;
                }

                if (
                    unsafeWindow.hasInterfaceCookie === 'ni' &&
                    unsafeWindow.Engine?.allInit
                ) {
                    resolve();
                    return;
                }

                setTimeout(check, 50);
            };

            check();
        });
    }

    initGame().then(addon);
}loadScript();

function addon() {
logComand(`Skrypt Załadowany Pomyślnie`, 'PURPLE');
    window.addonAPI = new class addonAPI {
        constructor() {
            this.interface = unsafeWindow.hasInterfaceCookie;
        }

        get isOld() {
            return this.interface === "si";
        }

        get g() {
            return this.isOld ? window.g : window.Engine;
        }

        get hero() {
            return this.isOld ? window.hero : window.Engine.hero.d;
        }

        get map() {
            return this.isOld ? window.map : window.Engine.map.d;
        }

        get allInit() {
            return this.isOld ? window.g?.init === 5 : window.Engine?.allInit;
        }

        async load() {
            return new Promise(resolve => {
                const wait = () => {
                    if (this.allInit) resolve();
                    else setTimeout(wait, 20);
                };
                wait();
            });
        }

        getItems() {
            return this.isOld ? window.g.item : window.Engine.items.fetchLocationItems('g');
        }

        getOther() {
            return this.isOld ? window.g.other : window.Engine.others.check();
        }

        getNpc() {
            return this.isOld ? window.g.npc : window.Engine.npcs.check();
        }

        isLoot() {
            if (this.isOld) return window.g.loots;

            return window.Engine.loots && window.Engine.loots.closeInterval !== undefined;
        }

        heroIsMove() {
            if (this.isOld) {
                return hero.isMoving !== 4;
            }

            return !Engine.communication.heroIdle;
        }

        isBattle() {
            if (this.isOld) {
                return g.battle && !g.battle.endBattle;
            }

            const battle = Engine.battle;

            const hasWarriors =
                battle.warriorsList &&
                Object.keys(battle.warriorsList).length > 1;

            if (battle.endBattle === false && battle.endBattleForMe === false && hasWarriors)
                return true;

            return false;
        }

        itemQuerySelector(id) {
            return this.isOld
                ? document.getElementById(`item${id}`)
                : document.querySelector(`div.item.item-id-${id}`);
        }

        hiddenAlert() {
            const alert = this.isOld
                ? document.querySelector("#alert")
                : document.querySelector(
                    "div.mAlert-layer.layer > div.border-window.ui-draggable.mAlert.no-exit-button.window-on-peak.askAlert"
                );

            if (alert) alert.style.display = "none";

            if (!this.isOld) {
                const backdrop = document.getElementsByClassName("window-backdrop")[0];
                if (backdrop) backdrop.style.display = "none";
            }
        }

        isDialogActiv() {
            return this.isOld
                ? unsafeWindow.g.talk.dialogCloud
                : unsafeWindow.Engine.dialogue;
        }
    };

}

