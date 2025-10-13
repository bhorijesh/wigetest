// global variables
let aswGetSpeechFromText = false;
let aswCurrentUtterance;
let _aswEnableReadingGuide = false;
let _aswEnableMagnifyText = false;
let _aswEnableReadingMask = false;
let aswReadingGuide;
let aswReadingMask;
let aswMaskWindow;
let aswMagnifyWrapper;
let aswIsDragging = false;
let apoffsetX;
let apoffsetY;
let apinterval;
let complianceData;
var asw_header_background_color;
var asw_header_font_color;
var asw_content_color;
var asw_default_language;
var asw_selected_languages;
var asw_widget_size;
var aswEnableMenuSettings;
var asw_Active_Plan;
let aswliveTheme = false;

// Check Theme in editor mode or live mode
const params = new URLSearchParams(window.location.search);
// if (!Shopify.designMode) {
aswliveTheme = true;
// }
const aswSetDefaultLocalStorage = () => {
    localStorage.setItem("apSelectedLanguage", asw_default_language);
    localStorage.setItem("isStopAnimationEnabled", 0);
    localStorage.setItem("isMuteSoundEnabled", 0);
    localStorage.setItem("isHideImageEnabled", 0);
    localStorage.setItem("isHideVideoEnabled", 0);
};


const aswFetchConfigs = async (url, tokens) => {
    const { key, domain } = tokens;
    if (!key || !domain) {
        return;
    }
    var _data$user, _daata$data, _daata$data2, _userData$subscriptio;
    const response = await fetch(`${url}?key=${key}&domain=${domain}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    });

    let data = await response?.json();
    data = {
        "success": true,
        "user": {
            "subscription": {
                "name": "Free",
                "price": {
                    "amount": 0,
                    "currencyCode": "USD"
                }
            }
        },
        ...data?.data,
        ...data.compliance_content,
        ...data.compliance_title,

    }


    const daata = data

    console.log(daata)
    asw_paid_plan = (data === null || data === void 0 || (_data$user = data.user) === null || _data$user === void 0 || (_data$user = _data$user.subscription) === null || _data$user === void 0 ? void 0 : _data$user.name.toLowerCase()) == "free" ? false : true;
    const config = {
        icon: (daata === null || daata === void 0 || (_daata$data = daata.data) === null || _daata$data === void 0 ? void 0 : _daata$data.icon) || "default",
        position: daata === null || daata === void 0 ? void 0 : daata.data.icon_position,
        icon_stroke_color: daata === null || daata === void 0 ? void 0 : daata.data.icon_color_stroke,
        icon_fill_color: daata === null || daata === void 0 ? void 0 : daata.data.icon_color_fill,
        enable_features: daata === null || daata === void 0 ? void 0 : daata.data.enable_features,
        icon_style: (daata === null || daata === void 0 ? void 0 : daata.data.icon_style) || "thick",
        icon_size: (daata === null || daata === void 0 ? void 0 : daata.data.icon_size) || "default",
        menu_header_background_color: (daata === null || daata === void 0 ? void 0 : daata.data.menu_header_background_color) || "#000000ff",
        menu_header_font_color: (daata === null || daata === void 0 ? void 0 : daata.data.menu_header_font_color) || "#f2f2f2ff",
        menu_content_color: (daata === null || daata === void 0 ? void 0 : daata.data.menu_content_color) || "#000000ff",
        open_accessibility_profile: (daata === null || daata === void 0 ? void 0 : daata.data.open_accessibility_profile) !== undefined && (daata === null || daata === void 0 ? void 0 : daata.data.open_accessibility_profile) !== null ? daata === null || daata === void 0 ? void 0 : daata.data.open_accessibility_profile : true
    };
    console.log(config)
    complianceData = {
        compliance_title: data?.compliance_title,
        compliance_content: data?.compliance_content
    }
    if (config.enable_features) {
        if (aswliveTheme) {
            const data = await aswPageViewsCount(pageViewsCountURL);
            if (!(data !== null && data !== void 0 && data.success)) {
                return;
            }
        }
    } else {
        return;
    }
    const defaultEnableMenuSettings = {
        reset: true,
        mission: true,
        languages: true,
        profiles: true,
        readerprofile: true,
        adhdprofile: true,
        cognitiveprofile: true,
        seizureprofile: true,
        fontscale: true,
        letterspacing: true,
        linespacing: true,
        dyslexic: true,
        fontweight: true,
        alignment: true,
        contrast: true,
        saturation: true,
        images: true,
        videos: true,
        readingguide: true,
        readingmask: true,
        cursor: true,
        magnifier: true,
        headings: true,
        links: true,
        animation: true,
        sounds: true,
        describeimages: true,
        text2speech: true,
        textsummary: true,
        pagestructure: true
    };
    aswEnableMenuSettings = aswMergeSettings(defaultEnableMenuSettings, daata === null || daata === void 0 ? void 0 : daata.data.enableMenuSettings);
    const userData = data === null || data === void 0 ? void 0 : data.user;
    asw_Active_Plan = (userData === null || userData === void 0 || (_userData$subscriptio = userData.subscription) === null || _userData$subscriptio === void 0 ? void 0 : _userData$subscriptio.name) || "Free";

    const selectedLanguage = localStorage.getItem("apSelectedLanguage");
    if (!selectedLanguage) {
        localStorage.setItem("apSelectedLanguage", (daata === null || daata === void 0 ? void 0 : daata.data.default_menu_language) || "en");
    }

    asw_selected_languages = (daata === null || daata === void 0 ? void 0 : daata.data.selected_languages) || ["all"];
    asw_default_language = (daata === null || daata === void 0 ? void 0 : daata.data.default_menu_language) || "en";
    asw_widget_size = (daata === null || daata === void 0 ? void 0 : daata.data.widget_size) || "large";
    asw_header_background_color = config === null || config === void 0 ? void 0 : config.menu_header_background_color;
    asw_header_font_color = config === null || config === void 0 ? void 0 : config.menu_header_font_color;
    asw_content_color = config === null || config === void 0 ? void 0 : config.menu_content_color;
    if (localStorage.length === 0) {
        aswSetDefaultLocalStorage();
    }
    aswPrepareFrontend(config);
};
let aswSettings;
let asw_open_accessibility_profile;
function calcLoadingIconPosition(icon_size, default_position) {
    if (icon_size == "default" || icon_size == "1x") {
        let position = (14 + default_position).toString();
        return position + "px";
    }
    if (icon_size == "large" || icon_size == "1.5x") {
        let position = (20 + default_position).toString();
        return position + "px";
    }
    if (icon_size == "larger" || icon_size == "2x") {
        let position = (28 + default_position).toString();
        return position + "px";
    }
    if (icon_size == "small" || icon_size == "0.5x") {
        let position = (9 + default_position).toString();
        return position + "px";
    }
}
function aswPrepareFrontend(configs) {
    const {
        icon,
        position,
        icon_stroke_color,
        icon_fill_color,
        enable_features,
        icon_size,
        icon_style = "thick",
        open_accessibility_profile: open_profile
    } = configs;
    if (!enable_features) {
        return;
    }
    aswAppendChild(icon, icon_style);
    aswSettings = aswEnableMenuSettings;
    // defaults();
    // EnableMenuSettings?.languages && prepareLanguageList();
    aswIconSize(icon_size);
    // makeMenuDraggable();
    // onPageLoad();
    // open_accessibility_profile && toggleActions();

    asw_open_accessibility_profile = open_profile;
    const cssPositions = {
        TL: {
            left: "20px",
            top: "20px"
        },
        TR: {
            right: "20px",
            top: "20px"
        },
        CL: {
            left: "20px",
            top: "50%"
            // transform: "translateY(-50%)"
        },
        CR: {
            right: "20px",
            top: "50%"
            // transform: "translateY(-50%)"
        },
        BL: {
            left: "20px",
            bottom: "20px"
        },
        BR: {
            right: "20px",
            bottom: "20px"
        }
    };

    // const cssPositionsLoading = {
    //    TL: { left: calcLoadingIconPosition(icon_size, 20), top: calcLoadingIconPosition(icon_size, 20) },
    //    TR: { right: calcLoadingIconPosition(icon_size, 20), top: calcLoadingIconPosition(icon_size, 20) },
    //    CL: { left: calcLoadingIconPosition(icon_size, 20), top: "50%" },
    //    CR: { right: calcLoadingIconPosition(icon_size, 20), top: "50%" },
    //    BL: { left: calcLoadingIconPosition(icon_size, 20), bottom: calcLoadingIconPosition(icon_size, 20) },
    //    BR: { right: calcLoadingIconPosition(icon_size, 20), bottom: calcLoadingIconPosition(icon_size, 20) },
    // }
    document.getElementById("apMenuIconStroke").style.fill = icon_stroke_color;
    document.getElementById("apMenuIconFill").style.fill = icon_fill_color;
    const menuBtn = document.querySelector(".asw-menu-btn");
    const loadingIcon = document.querySelector("#loading-icon");
    const menu = document.querySelector(".asw-menu");
    const positionStyle = cssPositions[position];
    // const loadingPositionStyle = cssPositionsLoading[position];

    if (positionStyle) {
        for (const [property, value] of Object.entries(positionStyle)) {
            menuBtn.style[property] = value;
            menu.style[property] = value;
        }
        // for (const [property, value] of Object.entries(loadingPositionStyle)) {
        //    loadingIcon.style[property] = value;
        // }
    }
    if (position === "CL" || position === "CR") {
        menu.style.top = "unset";
        menu.style.bottom = "20px";
    }
}
async function aswPageViewsCount(pageViewsCountURL) {
    const { key, domain } = aswAuthTokens || {};
    if (!key || !domain) {
        return;
    }
    const requestOptions = {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            user: key,
            domain: domain,
        }),

        redirect: "follow"
    };
    const pvc = await fetch(pageViewsCountURL, requestOptions).then(response => response.json());
    return pvc;
}
function aswGetIcon(name) {
    let icons = {
        default: ` <svg class="asw-main-icon" xmlns="http://www.w3.org/2000/svg" fill="#ffffff" style="height: 45%; width: 45%; fill: #ffffff" viewBox="0 0 512 512"><path d="M256,112a56,56,0,1,1,56-56A56.06,56.06,0,0,1,256,112Z" /><path d="M432,112.8l-.45.12h0l-.42.13c-1,.28-2,.58-3,.89-18.61,5.46-108.93,30.92-172.56,30.92-59.13,0-141.28-22-167.56-29.47a73.79,73.79,0,0,0-8-2.58c-19-5-32,14.3-32,31.94,0,17.47,15.7,25.79,31.55,31.76v.28l95.22,29.74c9.73,3.73,12.33,7.54,13.6,10.84,4.13,10.59.83,31.56-.34,38.88l-5.8,45L150.05,477.44q-.15.72-.27,1.47l-.23,1.27h0c-2.32,16.15,9.54,31.82,32,31.82,19.6,0,28.25-13.53,32-31.94h0s28-157.57,42-157.57,42.84,157.57,42.84,157.57h0c3.75,18.41,12.4,31.94,32,31.94,22.52,0,34.38-15.74,32-31.94-.21-1.38-.46-2.74-.76-4.06L329,301.27l-5.79-45c-4.19-26.21-.82-34.87.32-36.9a1.09,1.09,0,0,0,.08-.15c1.08-2,6-6.48,17.48-10.79l89.28-31.21a16.9,16.9,0,0,0,1.62-.52c16-6,32-14.3,32-31.93S451,107.81,432,112.8Z" /></svg>`,
        wheelchair: `<svg class="asw-main-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 960" fill="#ffffff">
            <path d="M480 240q-33 0-56.5-23.5T400 160q0-33 23.5-56.5T480 80q33 0 56.5 23.5T560 160q0 33-23.5 56.5T480 240ZM680 880V680H480q-33 0-56.5-23.5T400 600V360q0-33 23.5-56.5T480 280q24 0 41.5 10.5T559 324q55 66 99.5 90.5T760 480v80q-53 0-107-23t-93-55v138h120q33 0 56.5 23.5T760 680v220h-80ZM400 880q-83 0-141.5-58.5T200 680q0-72 45.5-127T360 484v82q-35 14-57.5 44.5T280 680q0 50 35 85t85 35q39 0 69.5-22.5T514 720h82q-14 69-69 114.5T400 880Z" />
        </svg>`,
        blind: ` <svg class="asw-main-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill="#ffffff" style="fill: #ffffff">
            <path d="m240-60-64-48 104-139v-213q0-31 5.5-68.5T300-596l-60 34v142h-80v-188l216-123q8-5 17-7t19-2q24 0 44 12t30 33l31 67q20 44 61 66t102 22v80h-39L860-78l-35 20-237-413q-40-13-72.5-37.5T460-568q-10 29-15.5 66.5T441-432l79 112v260h-80v-200l-71-102-9 142L240-60Zm220-700q-33 0-56.5-23.5T380-840q0-33 23.5-56.5T460-920q33 0 56.5 23.5T540-840q0 33-23.5 56.5T460-760Z" />
        </svg>`,
        eye: `<svg class="asw-main-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill="#ffffff" style="fill: #ffffff"><path d="m644-428-58-58q9-47-27-88t-93-32l-58-58q17-8 34.5-12t37.5-4q75 0 127.5 52.5T660-500q0 20-4 37.5T644-428Zm128 126-58-56q38-29 67.5-63.5T832-500q-50-101-143.5-160.5T480-720q-29 0-57 4t-55 12l-62-62q41-17 84-25.5t90-8.5q151 0 269 83.5T920-500q-23 59-60.5 109.5T772-302Zm20 246L624-222q-35 11-70.5 16.5T480-200q-151 0-269-83.5T40-500q21-53 53-98.5t73-81.5L56-792l56-56 736 736-56 56ZM222-624q-29 26-53 57t-41 67q50 101 143.5 160.5T480-280q20 0 39-2.5t39-5.5l-36-38q-11 3-21 4.5t-21 1.5q-75 0-127.5-52.5T300-500q0-11 1.5-21t4.5-21l-84-82Zm319 93Zm-151 75Z" /></svg>`,
        accStraight: `<svg class="asw-main-icon" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" fill="#ffffff" style="fill: #ffffff"><path d="M480-720q-33 0-56.5-23.5T400-800q0-33 23.5-56.5T480-880q33 0 56.5 23.5T560-800q0 33-23.5 56.5T480-720ZM360-80v-520H120v-80h720v80H600v520h-80v-240h-80v240h-80Z" /></svg>`,
        settings: ` <svg class="asw-main-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill="#ffffff" style="fill: #ffffff"><path d="m370-80-16-128q-13-5-24.5-12T307-235l-119 50L78-375l103-78q-1-7-1-13.5v-27q0-6.5 1-13.5L78-585l110-190 119 50q11-8 23-15t24-12l16-128h220l16 128q13 5 24.5 12t22.5 15l119-50 110 190-103 78q1 7 1 13.5v27q0 6.5-2 13.5l103 78-110 190-118-50q-11 8-23 15t-24 12L590-80H370Zm70-80h79l14-106q31-8 57.5-23.5T639-327l99 41 39-68-86-65q5-14 7-29.5t2-31.5q0-16-2-31.5t-7-29.5l86-65-39-68-99 42q-22-23-48.5-38.5T533-694l-13-106h-79l-14 106q-31 8-57.5 23.5T321-633l-99-41-39 68 86 64q-5 15-7 30t-2 32q0 16 2 31t7 30l-86 65 39 68 99-42q22 23 48.5 38.5T427-266l13 106Zm42-180q58 0 99-41t41-99q0-58-41-99t-99-41q-59 0-99.5 41T342-480q0 58 40.5 99t99.5 41Zm-2-140Z" /></svg>`
    };
    return icons[name] || icons["default"];
}
function aswAppendChild(icon, icon_style) {
    const strokeR = icon_style === "solid" ? "50" : icon_style === "thin" ? "49" : "49";
    const gapR = icon_style === "solid" ? "0" : icon_style === "thin" ? "43" : "41";
    const fillR = icon_style === "solid" ? "40" : icon_style === "thin" ? "40" : "35";

    // create element with id #Access-Pro and append to body

    const aswWidget = document.createElement("div");
    aswWidget.id = "Access-Pro";
    document.body.appendChild(aswWidget);

    document.querySelector("#Access-Pro").innerHTML = `
    <div class="asw-menu" style="display: none;" id="aswMenu"> </div>
    <div id='Access-Pro-Icon' class="asw-widget">
<div class="asw-menu-btn" id="asw-icon" title="Open Accessibility Menu" role="button" aria-expanded="false" onclick="aswPrepareJavaScript()" >
<svg class="asw-outer-svg" viewBox="0 0 100 100">
   <circle id="apMenuIconStroke" cx="50" cy="50" r="${strokeR}" fill="#419d4a" />  
  <circle cx="50" cy="50" r="${gapR}" fill="white" />  
  <circle id="apMenuIconFill" cx="50" cy="50" r="${fillR}" fill="#419d4a" />  
</svg>
${aswGetIcon(icon)}
  <svg class="asw-loading-btn" id="loading-icon" style="display: none"  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
            <circle fill="#00000" stroke="#00000" stroke-width="15" r="15" cx="40" cy="100">
                <animate attributeName="opacity" calcMode="spline" dur="2" values="1;0;1;" keySplines=".5 0 .5 1;.5 0 .5 1" repeatCount="indefinite" begin="-.4">
                </animate>
            </circle>
            <circle fill="#00000" stroke="#00000" stroke-width="15" r="15" cx="100" cy="100">
                <animate attributeName="opacity" calcMode="spline" dur="2" values="1;0;1;" keySplines=".5 0 .5 1;.5 0 .5 1" repeatCount="indefinite" begin="-.2">
                </animate>
            </circle>
            <circle fill="#00000" stroke="#00000" stroke-width="15" r="15" cx="160" cy="100">
                <animate attributeName="opacity" calcMode="spline" dur="2" values="1;0;1;" keySplines=".5 0 .5 1;.5 0 .5 1" repeatCount="indefinite" begin="0">
                </animate>
            </circle>
        </svg>
 </div>
    </div>
 `;

    // prepareJavaScript();
}
const aswIconSize = value => {
    const icon = document.querySelector("#asw-icon");
    if (value == "default" || value == "1x") {
        icon.style.height = "46px";
        icon.style.width = "46px";
        // icon.style.padding = "3.5px";
        // icon.style.borderWidth = "4x";
        const loadingIcon = document.querySelector("#loading-icon");
        loadingIcon.style.height = "35px";
        loadingIcon.style.width = "35px";
    }
    if (value == "large" || value == "1.5x") {
        // const icon = document.querySelector("#asw-icon");
        icon.style.height = "66px";
        icon.style.width = "66px";
        // icon.style.padding = "5.5px";
        // icon.style.borderWidth = "6px";
        const loadingIcon = document.querySelector("#loading-icon");
        loadingIcon.style.height = "50px";
        loadingIcon.style.width = "50px";
    }
    if (value == "larger" || value == "2x") {
        // const icon = document.querySelector("#asw-icon");
        icon.style.height = "85px";
        icon.style.width = "85px";
        // icon.style.padding = "7.5px";
        // icon.style.borderWidth = "8px";
        const loadingIcon = document.querySelector("#loading-icon");
        loadingIcon.style.height = "65px";
        loadingIcon.style.width = "65px";
    }
    if (value == "small" || value == "0.5x") {
        // const icon = document.querySelector("#asw-icon");
        icon.style.height = "32px";
        icon.style.width = "32px";
        // icon.style.padding = "2.5px";
        // icon.style.borderWidth = "3.5px";
        const loadingIcon = document.querySelector("#loading-icon");
        loadingIcon.style.height = "22px";
        loadingIcon.style.width = "23px";
    }
};
function aswMergeSettings(defaultSetting, APISetting) {
    const mergedSettings = {
        ...defaultSetting
    };
    for (const key in APISetting) {
        if (aswIsObject(mergedSettings[key]) && aswIsObject(APISetting[key])) {
            mergedSettings[key] = aswMergeSettings(mergedSettings[key], APISetting[key]);
        } else {
            mergedSettings[key] = APISetting[key];
        }
    }
    return mergedSettings;
}
function aswIsObject(item) {
    return item && typeof item === "object" && !Array.isArray(item);
}
function aswIsSameDomain() {
    const referrer = document.referrer;
    const currentUrl = window.location.href;
    const referrerDomain = aswExtractDomain(referrer);
    const currentDomain = aswExtractDomain(currentUrl);
    return referrerDomain === currentDomain;
}
function aswExtractDomain(url) {
    const match = url.match(/^(?:https?:\/\/)?(?:www\.)?([^\/]+)/);
    return match ? match[1] : "";
}
let asw_paid_plan = false;
aswFetchConfigs(APURL, aswAuthTokens);