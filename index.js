// ==UserScript==
// @name         Boeing-GeoFS-Alarms
// @namespace    https://github.com/Computer55x/Boeing-737-GeoFS-alarms
// @version      0.1
// @description  Adds alarms to GeoFS
// @match        https://www.geo-fs.com/geofs.php*
// @grant        GM.getResourceUrl
// @resource     bankangle https://github.com/Computer55x/Boeing-737-GeoFS-alarms/bankangle.ogg
// @resource     stall https://github.com/Computer55x/Boeing-737-GeoFS-alarms/stall.ogg
// @resource     overspeed https://github.com/Computer55x/Boeing-737-GeoFS-alarms/overspeed.ogg
// ==/UserScript==

(function () {
    'use strict';
    //load the audio clips
    let stickShake
    GM.getResoucreUrl("stall").then(
        (data)=>
            stickShake = new Audio(data);
            stickShake.loop = true;
        }
    );
    let overspeedClacker;
    GM.getResourceUrl("overspeed").then(
        (data) => {
            overspeedClacker = new Audio(data);
            overspeedClacker.loop = true;
        }
    );
    // wait until flight sim is fully loaded
    let itv = setInterval(
        function(){
            if(unsafeWindow.ui && unsafeWindow.flight){
                main();
                clearInterval(itv);
            }
        }
    ,500);
    function main(){
        // monkey-patch the stall.setVisibility method
        let prevStalled = false;
        unsafeWindow.ui.hud.stall.setVisOld = unsafeWindow.ui.hud.stall.setVisibility;
        unsafeWindow.ui.hud.stall.setVisibility = function (a) {
            if (a) {
                stickShake.play();
            } else if (prevStalled) {
                stickShake.pause();
            }
            prevStalled = a;
            this.setVisOld(a);
        }
        // monkey-patch the setAnimationValue method
        let prevOversped = false;
        unsafeWindow.flight.setAniValOld = unsafeWindow.flight.setAnimationValues;
        unsafeWindow.flight.setAnimationValues = function(a) {
            this.setAniValOld(a);
            let hasOversped = unsafeWindow.geofs.animation.values.kias >= 350;
            if (hasOversped && !prevOversped){
                overspeedClacker.play();
            } else if (!hasOversped && prevOversped){
                overspeedClacker.pause();
            }
            prevOversped = hasOversped;
        }
    }
})();
