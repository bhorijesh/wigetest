const accessProDevMode = true;


let accessProProxyHandle,
    accessProStaticPath,
    accessProInitializeCSS,
    accessProStyleCSS,
    accessProInitializeAppScript,
    accessProAppScript,
    accessProNewStyleCSS,
    accessProAppNewScript,
    aswAuthTokens,
    accessProIconsScript,
    accessProGoogleLangsScript;



if (accessProDevMode) {
    accessProProxyHandle = 'https://cdn.jsdelivr.net/gh/bhorijesh/widget/widget';
    accessProStaticPath = 'https://cdn.jsdelivr.net/gh/bhorijesh/widget/widget';
} else {
    accessProProxyHandle = 'https://cdn.jsdelivr.net/gh/bhorijesh/widget/widget';
    accessProStaticPath = 'https://cdn.jsdelivr.net/gh/bhorijesh/widget/widget';
}

// if (accessProDevMode) {
// Old Files
accessProInitializeCSS = `${accessProStaticPath}/initializeapp.css`;
accessProStyleCSS = `${accessProStaticPath}/style.css`;
accessProInitializeAppScript = `${accessProStaticPath}/initializeapp.js`;
accessProAppScript = `${accessProStaticPath}/app.js`;

// New Files
accessProNewStyleCSS = `${accessProStaticPath}/style-new.css`;
accessProAppNewScript = `${accessProStaticPath}/app-new.js`;
accessProIconsScript = `${accessProStaticPath}/app-icons.js`;
accessProGoogleLangsScript = `${accessProStaticPath}/acp-languages.js`;
// } else {
// Old Files
// accessProInitializeCSS = "{{ 'initializeapp.min.css' | asset_url }}";
// accessProStyleCSS = "{{ 'style.min.css' | asset_url }}";
// accessProInitializeAppScript = "{{ 'initializeapp.min.js' | asset_url }}";
// accessProAppScript = "{{ 'app.min.js' | asset_url }}";

// // New Files
// accessProNewStyleCSS = "{{ 'style-new.min.css' | asset_url }}";
// accessProAppNewScript = "{{ 'app-new.min.js' | asset_url }}";
// accessProIconsScript = "{{ 'app-icons.min.js' | asset_url }}";
// }


// URLs
const accessProSettingsUrl = `${accessProProxyHandle}/widget-settings/public`;
const accessProPageViewsCountUrl = `${accessProProxyHandle}/pageviews/reduce/`;

// Translation URL
var shopify_domain = `https://${window.location.hostname}`;
const accessProTranslationUrl = `https://access-pro-api.entanglecommerce.com/api/v1/language/translate/?domain=${shopify_domain}`;

var pageViewsCountURL = `${accessProProxyHandle}/theme/pageviews-update/`

const ACCESSPRO_COMPLIANCE_STATEMENT = `<div class="ap-compliance-main-title"><strong>AccessPro Compliance Mission Statement</strong></div> <div class="ap-compliance-list-wrapper"><div class="ap-compliance-list-item">• <strong>WCAG 2.2 Commitment:</strong> We strictly adhere to WCAG 2.2 AA guidelines.</div><div class="ap-compliance-list-item">• <strong>Personalized UI:</strong> Users with disabilities can personalize the interface.</div><div class="ap-compliance-list-item">• <strong>AI-Based Compliance:</strong> We use AI to maintain accessibility during updates.</div><div class="ap-compliance-list-item">• <strong>ARIA Attributes:</strong> Meaningful data for screen-readers using ARIA attributes.</div> </div> <div class="ap-compliance-list-wrapper"><div class="ap-compliance-list-title"><strong>Optimized Screen Reader and Keyboard Navigation:</strong></div><div class="ap-compliance-list"><div class="ap-compliance-list-item">• <strong>Screen-reader Optimization:</strong> ARIA attributes for meaningful data.</div> <div class="ap-compliance-list-item">• <strong>Image Description:</strong> Auto image descriptions for better understanding.</div> <div class="ap-compliance-list-item">• <strong>OCR Technology:</strong> Text extraction from images.</div> <div class="ap-compliance-list-item">• <strong>Keyboard Navigation:</strong> Enhanced keyboard operability. </div><div class="ap-compliance-list-item">• <strong>Content-skip Menus:</strong> Easy navigation with shortcuts.</div><div class="ap-compliance-list-item">• <strong>Popup Handling:</strong> Improved handling of popups.</div><div class="ap-compliance-list-item">• <strong>Shortcuts:</strong> Quick access to key elements with shortcuts.</div></div> </div> <div class="ap-compliance-list-wrapper"><div class="ap-compliance-list-title"><strong>Specialized Profiles for Disabilities:</strong></div><div class="ap-compliance-list"><div class="ap-compliance-list-item">• <strong>Epilepsy Safe Profile:</strong> Safe browsing with reduced triggers.</div><div class="ap-compliance-list-item">• <strong>Vision Impaired Profile:</strong> Enhanced interface for visual impairments.</div> <div class="ap-compliance-list-item">• <strong>Cognitive Disability Profile:</strong> Assistive features for cognitive disabilities.</div> <div class="ap-compliance-list-item">• <strong>ADHD-Friendly Profile:</strong> Minimized distractions for ADHD users.</div><div class="ap-compliance-list-item">• <strong>Blind Users Profile:</strong> Compatibility with popular screen-readers.</div><div class="ap-compliance-list-item">• <strong>Keyboard Navigation Profile:</strong> Navigate with keyboard commands.</div></div> </div> <div class="ap-compliance-list-wrapper"><div class="ap-compliance-list-title"><strong>Customizable User Interface Adjustments:</strong></div><div class="ap-compliance-list"><div class="ap-compliance-list-item">• <strong>Font Adjustments:</strong> Customize font settings for readability.</div><div class="ap-compliance-list-item">• <strong>Colour Adjustments:</strong> Choose contrast profiles and color schemes.</div><div class="ap-compliance-list-item">• <strong>Animations:</strong> Disable animations for user safety.</div><div class="ap-compliance-list-item">• <strong>Content Highlighting:</strong> Emphasize key elements.</div><div class="ap-compliance-list-item">• <strong>Audio Muting:</strong> Instantly mute the website.</div><div class="ap-compliance-list-item">• <strong>Cognitive Disorders:</strong> Linked search engine for better understanding.</div><div class="ap-compliance-list-item">• <strong>Additional Functions:</strong> Various customizable options.</div></div> </div> <div class="ap-compliance-list-wrapper"><div class="ap-compliance-list-title"><strong>Browser and Assistive Technology Support:</strong></div><div class="ap-compliance-list"><div class="ap-compliance-list-item">• <strong>Supported Browsers:</strong> Google Chrome, Mozilla Firefox, Apple Safari, Opera, Microsoft Edge.</div><div class="ap-compliance-list-item">• <strong>Supported Screen Readers:</strong> JAWS (Windows/MAC), NVDA (Windows/MAC).</div></div> </div> <div class="ap-compliance-list-wrapper"><div class="ap-compliance-list-title"><strong>Continual Accessibility Improvement:</strong></div><div class="ap-compliance-list"> <div class="ap-compliance-list-item">• <strong>Ongoing Efforts:</strong> We continuously enhance accessibility. </div> <div class="ap-compliance-list-item">• <strong>Goal:</strong> Achieve maximum accessibility with evolving technology.</div><div class="ap-compliance-list-item">• <strong>Contact Us:</strong> Reach out via the website’s contact form for queries or concerns.</div></div> </div>`



class AccessProIcon {
    constructor() {
        this.accessProInstance = null;
        this.isLoading = false;
        this.complianceData = {}
        this.enableMenuSettings = false;
        this.settings = {};
        this.user = {};
        this.widgetStyle = "compact"

        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", () => this.init());
        } else {
            this.init();
        }
    }

    async init() {
        /* --- Specific to Web --- */
        this.initWeb();
        /*------------------------*/
        this.config = await this.fetchConfig();
        this.isWidgetOpenedOnce = localStorage.getItem("acp-widget-opened") === "true";
        if (this.config?.success) {
            this.widgetStyle = this.config.data?.template || "default";
            const cssPath = accessProNewStyleCSS;


            const customCSS = this.config.data?.custom_css || "";
            console.log(customCSS);
            if (customCSS) {
                const style = document.createElement("style");
                style.innerHTML = customCSS;
                document.head.appendChild(style);
            }

            this.reducePageViews();
            if (["compact", "minimal", "modern"].includes(this.widgetStyle)) {
                // Reduce the page views
                // if (!Shopify?.designMode) {

                // }
            } else {
                const acpElement = document.getElementById("acp-widget");
                if (acpElement) {
                    acpElement.style.display = "none";
                }
            }


            if (!document.querySelector(`link[href="${cssPath}"]`)) {
                const link = document.createElement("link");
                link.rel = "stylesheet";
                link.href = cssPath;
                link.onload = () => {
                    this.settings = this.mergeSettings(this.config.data);
                    this.complianceData = this.config.data?.compliance;
                    this.user = this.config.data?.user;
                    this.render({
                        icon: this.settings.icon,
                        icon_color_fill: this.settings.icon_color_fill,
                        icon_color_stroke: this.settings.icon_color_stroke,
                        icon_position: this.settings.icon_position,
                        icon_style: this.settings.icon_style,
                        icon_size: this.settings.icon_size,
                        custom_position: this.settings.custom_position,
                    });
                };
                document.head.appendChild(link);
            }

            if (this.isWidgetOpenedOnce) {
                this.loadJavaScript();
            }
        } else {
            return;
        }
    }

    render(iconSettings) {
        this.aswAppendIcon(iconSettings);
    }

    aswGetIcon(name) {
        const icons = {
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

    loadJavaScript() {
        const scriptPath = accessProAppNewScript;

        // Set isLoading to true when the script starts loading
        this.isLoading = true;

        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (document.querySelector(`script[src="${scriptPath}"]`)) {
                    this.isLoading = false; // Set isLoading to false if the script is already loaded
                    resolve();
                    return;
                }
                const script = document.createElement("script");
                script.src = scriptPath;
                script.onload = async () => {
                    accessProRenderWidget(this.settings, this.complianceData, this.user)
                        .then((widgetInstance) => {
                            this.accessProInstance = widgetInstance;
                            if (this.accessProInstance && !this.isWidgetOpenedOnce) {
                                this.accessProInstance.toggleWidget();
                            }
                            this.isLoading = false; // Set isLoading to false after successful load
                            resolve();
                        })
                        .catch((error) => {
                            this.isLoading = false; // Set isLoading to false on error
                            reject(error);
                        }).finally(() => {
                            // remove the features containers if they are empty
                            const featuresContainers = document.querySelectorAll(".acp-features");
                            featuresContainers.forEach(container => {
                                const itemsContainer = container.querySelector(".acp-features-list");
                                if (itemsContainer.innerHTML === '') {
                                    container.remove();
                                }
                            });

                            document.querySelector('.accesspro').addEventListener('keydown', function (event) {
                                const target = event.target;

                                // Only apply to elements with role="button" and tabindex="0"
                                if (
                                    target.getAttribute('role') === 'button' &&
                                    target.getAttribute('tabindex') === '0'
                                ) {
                                    if (event.key === 'Enter' || event.key === ' ') {
                                        event.preventDefault(); // Prevent scrolling on space
                                        target.click(); // Trigger the click
                                    }
                                }
                            });
                        });

                };
                script.onerror = (error) => {
                    this.isLoading = false; // Set isLoading to false on error
                    reject(error);
                };
                document.head.appendChild(script);
            }, 500);
        });
    }


    async onClick() {
        if (this.isLoading) return; // Prevent multiple clicks during loading
        this.isLoading = true; // Set loading state
        const loaderButton = document.querySelector(".acp-loader-button");
        loaderButton.style.display = "block"; // Show loader

        try {
            await this.loadJavaScript();
        } catch (error) {
            console.error("Error loading JavaScript:", error);
        } finally {
            loaderButton.style.display = "none"; // Hide loader
            this.isLoading = false; // Reset loading state  
        }
    }

    toggleWidget() {
        if (this.accessProInstance) {
            this.accessProInstance.toggleWidget();
        } else {
            this.onClick();
        }
    }

    aswAppendIcon(iconSettings) {
        const { icon, icon_color_fill, icon_color_stroke, icon_position, icon_style, icon_size, custom_position } = iconSettings;

        const strokeR = icon_style === "solid" ? "50" : icon_style === "thin" ? "49" : "49";
        const gapR = icon_style === "solid" ? "0" : icon_style === "thin" ? "43" : "41";
        const fillR = icon_style === "solid" ? "40" : icon_style === "thin" ? "40" : "35";

        const activeCheckStyles = {
            small: "width: 17px; height: 17px;",
            "0.5x": "width: 17px; height: 17px;",
            medium: "width: 20px; height: 20px;",
            "1x": "width: 20px; height: 20px;",
            large: "width: 25px; height: 25px;",
            "1.5x": "width: 25px; height: 25px;",
            extraLarge: "width: 30px; height: 30px;",
            "2x": "width: 30px; height: 30px;",
            default: "width: 20px; height: 20px;",
        }

        const customPosition = {
            top: custom_position.top || 20,
            left: custom_position.left || 20,
            bottom: custom_position.bottom || 20,
            right: custom_position.right || 20,
        }

        const iconPositionStyles = {
            TL: `top: ${customPosition.top}px; left: ${customPosition.left}px; bottom: auto; right: auto;`,
            TR: `top: ${customPosition.top}px; right: ${customPosition.right}px; bottom: auto; left: auto;`,
            BL: `bottom: ${customPosition.bottom}px; left: ${customPosition.left}px; top: auto; right: auto;`,
            BR: `bottom: ${customPosition.bottom}px; right: ${customPosition.right}px; top: auto; left: auto;`,
            CL: `left: ${customPosition.left}px; top: 50%; transform: translateY(-50%); bottom: auto; right: auto;`,
            CR: `right: ${customPosition.right}px; top: 50%; transform: translateY(-50%); bottom: auto; left: auto;`,
        };

        const iconSizeStyles = {
            small: "width: 40px; height: 40px;",
            "0.5x": "width: 40px; height: 40px;",
            medium: "width: 50px; height: 50px;",
            "1x": "width: 50px; height: 50px;",
            large: "width: 60px; height: 60px;",
            "1.5x": "width: 60px; height: 60px;",
            extraLarge: "width: 75px; height: 75px;",
            "2x": "width: 75px; height: 75px;",
            default: "width: 50px; height: 50px;",
        };

        const loaderStyles = `
            border-top: 5px solid #ffffff;
            border-right: 5px solid ${icon_color_stroke};
            border-bottom: 5px solid #ffffff;
            border-left: 5px solid ${icon_color_stroke};`

        document.querySelector("#acp-icon").innerHTML = `
            <div id="Access-Pro-Icon" class="asw-widget">
                <button class="asw-menu-btn" id="asw-icon" 
                    title="Open Accessibility Menu" 
                    role="button" 
                    aria-expanded="false"
                    tabIndex="0"
                    style="${iconPositionStyles[icon_position]} ${iconSizeStyles[icon_size]}"
                    onclick="iconInstance.toggleWidget()">
                    <svg class="asw-outer-svg" viewBox="0 0 100 100">
                        <circle id="apMenuIconStroke" cx="50" cy="50" r="${strokeR}" fill="${icon_color_stroke}" />  
                        <circle cx="50" cy="50" r="${gapR}" fill="white" />  
                        <circle id="apMenuIconFill" cx="50" cy="50" r="${fillR}" fill="${icon_color_fill}" />  
                    </svg>
                    ${this.aswGetIcon(icon)}
                    <div class="acp-loader-button" style="display: none; ${loaderStyles} ${iconSizeStyles[icon_size]}"></div>
                     <svg class="asw-active-check asw-feature-not-active"
                     style="background: ${icon_color_fill}; ${activeCheckStyles[icon_size] || activeCheckStyles["default"]};"
                     xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed"><path d="m424-296 282-282-56-56-226 226-114-114-56 56 170 170Zm56 216q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/></svg>
                </button>
            </div>
          `;
    }

    // Fetch the config from the server
    async fetchConfig() {
        // return {
        //     success: true,
        //     data: {
        //         // ...data.data?.data || {},
        //         compliance: {
        //             // compliance_title: data.data?.compliance_title || "Accessibility Menu",
        //             // compliance_content: data.data?.compliance_content || ACCESSPRO_COMPLIANCE_STATEMENT,
        //         }
        //     }

        // }
        try {
            const tokens = this.aswGetKeys();
            aswAuthTokens = tokens;
            const { key, domain } = tokens;
            // if (!key || !domain) {
            //     return;
            // }
            const siteId = window.ACCESSPRO_SITE_ID || document.documentElement.getAttribute("data-wf-site");

            const response = await fetch(`${accessProSettingsUrl}?siteId=${siteId}`, {
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const data = await response.json();

            const success = data?.success || false;

            if (!success) {
                console.error('Error fetching config:', data);
                return null;
            } else {
                return {
                    success: true,
                    data: {
                        ...data.data?.data || {},
                        compliance: {
                            compliance_title: data.data?.compliance_title || "Accessibility Menu",
                            compliance_content: data.data?.compliance_content || ACCESSPRO_COMPLIANCE_STATEMENT,
                        }
                    }

                }
            }

        } catch (error) {
            console.error('Error fetching config:', error);
            return null;
        }
    }

    // Reduce the page views
    async reducePageViews() {
        return true;
        const formdata = new FormData();
        formdata.append("shopify_domain", shopify_domain);
        const tokens = this.aswGetKeys();
        const { key, domain } = tokens;
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

        const pvc = await fetch(accessProPageViewsCountUrl, requestOptions).then(response => response.json());
        return pvc;
    }

    // Merge the settings with the default settings
    mergeSettings = (settings = {}) => {
        const {
            enableMenuSettings = {},
            enable_features = true,
            icon = "default",
            icon_color_fill = "#419d4a",
            icon_color_stroke = "#419d4a",
            icon_position = "BL",
            icon_style = "thick",
            icon_size = "default",
            menu_content_background_color = "#eff1f5",
            menu_content_color = "#111111",
            menu_header_background_color = "#111111",
            menu_header_font_color = "#f2f2f2",
            open_accessibility_profile = true,
            selected_languages = ["en", "fr", "es", "de"],
            default_menu_language = "en",
            widgetheight = "popup",
            widget_size = "large",
            template = "default",
            custom_position = {
                top: "20",
                left: "20",
                bottom: "20",
                right: "20",
            },
            custom_css = "",
        } = settings;

        const defaultMenuSettings = {
            adhdprofile: true,
            alignment: true,
            animation: true,
            cognitiveprofile: true,
            contrast: true,
            cursor: true,
            dyslexic: true,
            fontscale: true,
            fontweight: true,
            headings: true,
            images: true,
            languages: true,
            letterspacing: true,
            linespacing: true,
            links: true,
            magnifier: true,
            mission: true,
            profiles: true,
            readerprofile: true,
            readingguide: true,
            readingmask: true,
            reset: true,
            saturation: true,
            seizureprofile: true,
            sounds: true,
            text2speech: true,
            describeimages: false,
            videos: true,
            pagestructure: true,
            textsummary: true,
        };
        const mergedMenuSettings = { ...defaultMenuSettings, ...enableMenuSettings };

        return {
            enable_features,
            icon,
            icon_color_fill,
            icon_color_stroke,
            icon_position,
            icon_style,
            icon_size,
            menu_content_color,
            menu_header_background_color,
            menu_content_background_color,
            menu_header_font_color,
            open_accessibility_profile,
            selected_languages: [...selected_languages, default_menu_language],
            default_menu_language,
            widget_size,
            widgetheight,
            custom_position,
            template,
            // remove branding for web
            remove_branding: true,
            enableMenuSettings: mergedMenuSettings,
            custom_css,
        };
    };


    /* --- Specific to Web --- */
    initWeb() {
        // Create and insert the Access-Pro div
        const accessProDiv = document.createElement('div');
        accessProDiv.id = 'Access-Pro';
        document.body.appendChild(accessProDiv);

        // Create and insert the acp-icon div
        const acpIconDiv = document.createElement('div');
        acpIconDiv.id = 'acp-icon';
        document.body.appendChild(acpIconDiv);

        // Create and insert the acp-widget div with a class
        const acpWidgetDiv = document.createElement('div');
        acpWidgetDiv.id = 'acp-widget';
        acpWidgetDiv.classList.add('asw-menu');
        document.body.appendChild(acpWidgetDiv);

        // Additional elements

        // acp-definition-popup
        const definitionPopup = document.createElement('div');
        definitionPopup.id = 'acp-definition-popup';
        document.body.appendChild(definitionPopup);

        // acp-dictionary-toast
        const dictionaryToast = document.createElement('div');
        dictionaryToast.id = 'acp-dictionary-toast';
        dictionaryToast.className = 'asw-text-speech-bar';
        dictionaryToast.style.display = 'none';
        dictionaryToast.setAttribute('data-ap-translate', 'DICTIONARY DESC');
        dictionaryToast.innerText = 'Double click the content to see meaning';
        document.body.appendChild(dictionaryToast);

        // acp-virtualKeyboardPopup
        const virtualKeyboardPopup = document.createElement('div');
        virtualKeyboardPopup.id = 'acp-virtualKeyboardPopup';
        virtualKeyboardPopup.setAttribute('role', 'dialog');
        virtualKeyboardPopup.setAttribute('aria-modal', 'true');
        virtualKeyboardPopup.setAttribute('aria-label', 'Virtual keyboard popup');

        // Close button with SVG
        const closeBtn = document.createElement('button');
        closeBtn.style.display = 'none';
        closeBtn.setAttribute('aria-label', 'Close virtual keyboard');
        closeBtn.id = 'acp-closeKeyboardBtn';
        closeBtn.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M6 6L18 18" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        `;
        virtualKeyboardPopup.appendChild(closeBtn);

        // Virtual keyboard container
        const keyboardDiv = document.createElement('div');
        keyboardDiv.id = 'acp-virtual-keyboard';
        keyboardDiv.className = 'simple-keyboard';
        virtualKeyboardPopup.appendChild(keyboardDiv);

        document.body.appendChild(virtualKeyboardPopup);

        // Make the keyboard draggable
        function makeDraggableVirtualKeyboard(el) {
            let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
            el.onmousedown = dragMouseDown;

            function dragMouseDown(e) {
                e.preventDefault();
                pos3 = e.clientX;
                pos4 = e.clientY;
                document.onmouseup = closeDragElement;
                document.onmousemove = elementDrag;
            }

            function elementDrag(e) {
                e.preventDefault();
                pos1 = pos3 - e.clientX;
                pos2 = pos4 - e.clientY;
                pos3 = e.clientX;
                pos4 = e.clientY;
                el.style.top = el.offsetTop - pos2 + 'px';
                el.style.left = el.offsetLeft - pos1 + 'px';
                el.style.bottom = 'unset';
                el.style.right = 'unset';
            }

            function closeDragElement() {
                document.onmouseup = null;
                document.onmousemove = null;
            }
        }

        makeDraggableVirtualKeyboard(virtualKeyboardPopup);

        console.log("Virtual keyboard popup created");
    }


    /* --- Specific to Web --- */
    aswGetInstanceId = () => {
        const scriptElement = document.getElementById('aswWidgetScript');
        return scriptElement?.getAttribute('data-aswid') || null;
    };

    aswGetKeys = () => {
        const scriptElement = document.getElementById('aswWidgetScript');
        if (scriptElement) {
            const aswkey = scriptElement.getAttribute('data-aswkey');
            const aswdomain = scriptElement.getAttribute('data-aswdomain');
            return {
                key: aswkey,
                domain: aswdomain
            }
        }
        return {}
    };



}

// Create an instance of the icon
const iconInstance = new AccessProIcon();

