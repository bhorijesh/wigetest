// Global variables and constants
let accessProTranslations = {}
let accessProPlanName;
let accessProTemplate = 'default';

let accessProTextToSpeech = null;
let accessProTextSummary = null;
let accessProVirtualKeyboaard = null;
let accessProDictionary = null;
let accessProFeatures = [];

const checkIfAnyFeatureActive = () => {
    let anyActive = false;

    accessProFeatures.forEach(feature => {
        if (feature.isActive) {
            anyActive = true;
            return;
        }
    });

    if (!anyActive) {
        const shortcutBtn = document.querySelector('#acp-shortcut-button');
        if (shortcutBtn && shortcutBtn.classList.contains('active')) {
            anyActive = true;
        }
    }

    const activeIcon = document.querySelector('.asw-active-check');
    if (!activeIcon) return;
    if (anyActive) {
        // remove ckass name asw-feature-not-active 
        activeIcon.classList.remove('asw-feature-not-active');
    } else {
        // add class name asw-feature-not-active
        activeIcon.classList.add('asw-feature-not-active');
    }
}

// listen for acpFeatureToggled event 
window.addEventListener('acpFeatureToggled', (event) => {
    setTimeout(() => {
        checkIfAnyFeatureActive();
    }, 1000);
});

checkIfAnyFeatureActive();

// Feature usage for analytics


// async function aswFeaturesUsageUpdate(feature) {
//     return;
//     fetch(`${accessProProxyHandle}/theme/analytic/${feature}/update`, {
//         method: "GET"
//     });
// }

async function aswFeaturesUsageUpdate(feature) {
    console.log(`Feature usage updated: ${feature}`);
    // make the feature key like this: widgetOpen if it is widget-open
    const modifiedFeature = feature.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase())
    if (true) {
        fetch(`${accessProProxyHandle}/analytic/`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                domain: aswAuthTokens?.domain,
                key: aswAuthTokens?.key,
                [modifiedFeature]: 1
            }),

        });
    }
}

// Collapsible section class specially for language and profiles
class AccessProCollapsible {
    constructor(title, contentId, initiallyExpanded = false, titleTranslationKey = "") {
        this.title = title;
        this.contentId = contentId;
        this.titleTranslationKey = titleTranslationKey;
        this.isExpanded = initiallyExpanded;
    }

    toggle() {
        this.isExpanded = !this.isExpanded;
        this.updateUI();
    }

    render(container) {
        this.collapsibleContainer = document.createElement('div');
        this.collapsibleContainer.className = 'acp-collapsible';
        this.header = document.createElement('div');
        this.header.setAttribute('role', 'button');
        this.header.setAttribute('tabindex', '0');
        this.header.className = 'acp-collapsible-header';

        this.headerText = document.createElement('div');
        this.headerText.className = 'acp-collapsible-header-text';

        if (this.titleTranslationKey) {
            this.headerText.setAttribute('data-ap-translate', this.titleTranslationKey);
        }
        this.headerText.innerHTML = this.title;

        this.headerIcon = document.createElement('span');
        this.headerIcon.className = 'acp-collapsible-header-icon';
        this.headerIcon.style.transition = 'transform 0.3s';
        this.headerIcon.innerHTML = ACCESSPRO_ICONS.caret;

        this.header.appendChild(this.headerText);
        this.header.appendChild(this.headerIcon);

        this.header.setAttribute('aria-expanded', this.isExpanded);
        this.header.setAttribute('aria-controls', this.contentId);
        this.header.setAttribute('tabindex', '0');
        this.header.addEventListener('click', () => this.toggle());

        this.content = document.createElement('div');
        this.content.id = this.contentId;
        this.content.className = 'acp-collapsible-content';
        this.content.style.display = this.isExpanded ? 'grid' : 'none';

        this.collapsibleContainer.appendChild(this.header);
        this.collapsibleContainer.appendChild(this.content);
        container.appendChild(this.collapsibleContainer);
    }

    updateUI() {
        this.header.setAttribute('aria-expanded', this.isExpanded);
        this.content.style.display = this.isExpanded ? 'grid' : 'none';
    }

    setContent(contentHTML) {
        this.content.innerHTML = contentHTML;
    }
}

// AccessPro Speech to handle text to speech related functionalities
class AccessProSpeech {
    constructor() {
        this.aswCurrentUtterance = null;
        this.apinterval = null;
        this.aswVoices = [];
        this.aswSelectedVoiceName = "Google US English";
        this.selectedLanguage = localStorage.getItem("acp-active-language") || "en";
        this.initVoices();
        this.setEventListeners();
    }

    setEventListeners() {
        // Listen for the language change event
        window.addEventListener("acplanguageChanged", (event) => {
            this.selectedLanguage = event.detail.language;
            this.initVoices();
        });
    }

    async initVoices() {
        // Load initial voices if already available
        this.aswVoices = speechSynthesis.getVoices();
        // Listen for the voiceschanged event to update voices
        speechSynthesis.addEventListener("voiceschanged", () => {
            this.aswVoices = speechSynthesis.getVoices();
            this.loadVoices();
        });

        // If voices were already available, load them now
        if (this.aswVoices.length) {
            this.loadVoices();
        }
    }


    loadVoices() {
        let selectedVoice;
        if (this.selectedLanguage !== "en") {
            selectedVoice = this.aswVoices.find(voice => voice.lang.startsWith(`${this.selectedLanguage}-`)) || this.aswVoices[0];
        } else {
            selectedVoice = this.aswVoices.find(voice => voice.name === this.aswSelectedVoiceName);
        }
        if (!selectedVoice) {
            selectedVoice = this.aswVoices.find(voice => voice.name === "Samantha") || this.aswVoices[0]
        }
        this.selectedVoice = selectedVoice;
    }


    defineSpeechSynthesis() {
        const utterance = new SpeechSynthesisUtterance();
        utterance.pitch = 0.9;
        utterance.rate = 1;
        utterance.volume = 1;
        if (this.selectedVoice) {
            utterance.voice = this.selectedVoice;
        }
        return utterance;
    }

    speakWithElement(targetElement) {
        document.querySelectorAll(".aoda-speech-highlight").forEach(el => el.classList.remove("aoda-speech-highlight"));
        clearInterval(this.apinterval);

        // if (targetElement.textContent.trim() !== "" || targetElement.tagName.toLowerCase() === "img") {
        if (this.aswCurrentUtterance && speechSynthesis.speaking) {
            speechSynthesis.cancel();
        }

        targetElement.classList.add("aoda-speech-highlight");

        // Determine element type
        const elementType = this.getElementTypeDescription(targetElement);

        // Get the content
        let textContent = targetElement.tagName.toLowerCase() === "img" ? targetElement.alt : targetElement.innerText;

        // if text content is empty, get aria-label  or aria-labelledby and so on
        if (!textContent) {
            textContent = targetElement.getAttribute("aria-label") || targetElement.getAttribute("aria-labelledby") || targetElement.getAttribute("title");
        }


        // Final text to speak
        let textToSpeak = textContent ? ` ${textContent}, ${elementType}` : ` ${elementType}`;

        // if the element is input or textarea, add the type of input and the current value as well
        if (targetElement.tagName.toLowerCase() === "input" || targetElement.tagName.toLowerCase() === "textarea") {
            const inputType = targetElement.getAttribute("type") || "text";
            const inputValue = targetElement.value || "";
            textToSpeak = `${elementType} of type ${inputType}`
            if (inputValue) {
                textToSpeak += ` with value: ${inputValue}`;
            } else {
                textToSpeak += ` with no value`;
            }
        } else if (targetElement.tagName.toLowerCase() === "select") {
            const selectedOption = targetElement.options[targetElement.selectedIndex];
            const selectValue = selectedOption ? selectedOption.text : "no option selected";
            textToSpeak = `This is a select element with the selected option: ${selectValue}, ${elementType}`;
        }


        const utterance = this.defineSpeechSynthesis();
        utterance.text = textToSpeak;
        utterance.lang = "en-US";

        utterance.onend = () => {
            targetElement.classList.remove("aoda-speech-highlight");
        };
        utterance.onpause = () => {
            targetElement.classList.remove("aoda-speech-highlight");
        };

        window.speechSynthesis.speak(utterance);
        this.aswCurrentUtterance = utterance;

        this.apinterval = setInterval(() => {
            if (!speechSynthesis.speaking) {
                clearInterval(this.apinterval);
            } else {
                speechSynthesis.pause();
                speechSynthesis.resume();
            }
        }, 12000);
        // }
    }

    getElementTypeDescription(element) {
        const tag = element.tagName.toLowerCase();
        const role = element.getAttribute("role");

        if (role) {
            return `${role}`;
        }

        switch (tag) {
            case "a":
                return "link";
            case "button":
                return "button";
            case "h1":
            case "h2":
            case "h3":
            case "h4":
            case "h5":
            case "h6":
                return `heading`;
            case "img":
                return "image";
            case "input":
                return `input field`;
            case "textarea":
                return `text area`;
            case "label":
                return `label`;
            case "li":
                return `list item`;
            default:
                return ``;
        }
    }


    speak(text) {
        // Queue speech instead of interrupting
        if (speechSynthesis.speaking) {
            speechSynthesis.cancel();
        }

        clearInterval(this.apinterval);

        const utterance = this.defineSpeechSynthesis();
        utterance.text = text;
        utterance.lang = "en-US";

        // Add slight delay for better audio clarity
        utterance.onstart = () => {
            clearInterval(this.apinterval);
            this.apinterval = setInterval(() => {
                if (!speechSynthesis.speaking) {
                    clearInterval(this.apinterval);
                } else {
                    speechSynthesis.pause();
                    speechSynthesis.resume();
                }
            }, 15000);
        };

        window.speechSynthesis.speak(utterance);
        this.aswCurrentUtterance = utterance;
    }


    togglePause() {
        if (speechSynthesis.speaking) {
            if (speechSynthesis.paused) {
                speechSynthesis.resume();
                this.speak("Resuming speech");
            } else {
                speechSynthesis.pause();
                this.speak("Speech paused");
            }
        }
    }

    stop() {
        if (this.aswCurrentUtterance && speechSynthesis.speaking) {
            speechSynthesis.cancel();
        }
        clearInterval(this.apinterval);
    }
}

// Main AccessPro class to store and handle all the features/profiles
class AccessPro {
    constructor({
        containerId,
        defaultLanguage = 'en',
        template = 'compact',
        settings = {},
        complianceData = {}
    }) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            throw new Error(`Container with ID "${containerId}" not found.`);
        }

        this.features = [];
        this.profiles = [];
        this.languages = [];
        this.activeLanguage = null;
        this.language = 'en';
        this.state = {};
        this.isOpen = false;
        this.translations = {}
        this.defaultLanguage = defaultLanguage;
        this.template = template;
        this.settings = settings;
        this.widgetHeight = settings.widgetheight || 'popup';
        this.defaultWidgetSize = settings.widget_size || 'large';
        this.widgetSize = localStorage.getItem("acp-widget-size") || settings.widget_size || 'large';
        this.enableMenuSettings = settings?.enableMenuSettings || {};
        this.complianceData = complianceData;
        this.removeBranding = settings.remove_branding;
        this.shortCutsEnabled = localStorage.getItem('acp-shortcuts-enabled') === 'true';
        this.shortcutsMap = new Map();
        this.addHideWidgetButton = this.addHideWidgetButton.bind(this);

        if (["free", "starter", "starter_annual"].includes(accessProPlanName)) {
            this.removeBranding = false;
        } else if (["basic", "basic_annual", "standard", "standard_annual", "pro", "pro_annual", "premium", "premium_annual"].includes(accessProPlanName)) {
            this.removeBranding = true;
        }

        // check if language is in the local storage
        if (!localStorage.getItem("acp-active-language")) {
            localStorage.setItem("acp-active-language", this.defaultLanguage);
        }

        // this.init();

    }

    init() {
        this.renderWidget();
        this.attachEventListeners();
        this.attachPopoverListeners();
        this.addLanguageCollapsible();

        if (!this.enableMenuSettings?.languages) {
            const defaultLanguage = this.defaultLanguage;
            localStorage.setItem("acp-active-language", defaultLanguage);
            this.language = defaultLanguage;
            this.defaultLanguage = defaultLanguage;
        }

    }

    renderWidget() {
        // This part is hardcoded for now, will implement better way to handle this
        // But the content will hardly change so it's fine for now
        const { template, enableMenuSettings, removeBranding } = this;
        const { mission, reset, languages, profiles } = enableMenuSettings || {};

        this.widgetSizes = ["small, medium, large"]

        const isModernTemplate = ["modern", "minimal"].includes(template);
        const missionButton = mission ? `
      <div role="button" tabindex="0" class="acp-compliance" data-ap-translate="OUR MISSION">Accessibility Statement</div>
    ` : '';

        const resetButton = reset ? `
      <div role="button" tabindex="0" class="acp-reset">
      <span class="acp-reset-text" data-ap-translate="RESET TITLE">
      Reset Settings
      </span>
      <span class="acp-reset-icon">
        ${ACCESSPRO_ICONS.resetSettings}
      </span>
      <span class="acp-reset-tooltip" data-ap-translate="RESET TITLE">
        Reset Settings
      </span>
      </div>
    ` : '';

        const reportAProblem = `
    <a class="acp-report-a-problem" id="acp-report-a-problem" role="button" aria-label="Report a Problem" tabindex="0">
      <span class="acp-report-a-problem-icon">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
             stroke-width="1.5" stroke="currentColor" width="24" height="24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round"
                d="M3 3v1.5M3 21v-6m0 0 2.77-.693a9 9 0 0 1 6.208.682l.108.054a9 9 0 0 0 6.086.71l3.114-.732a48.524 48.524 0 0 1-.005-10.499l-3.11.732a9 9 0 0 1-6.085-.711l-.108-.054a9 9 0 0 0-6.208-.682L3 4.5M3 15V4.5" />
        </svg>
      </span>
      <span class="acp-report-a-problem-text" data-ap-translate="REPORT A PROBLEM">
        Report a Problem
      </span>
      <span class="acp-report-a-problem-tooltip" data-ap-translate="REPORT A PROBLEM">
        Report a Problem
      </span>
    </a>
  `;


        const languageSection = `
      <div id="languageWrapper" class="acp-language" ${languages ? '' : 'style="display: none;"'}></div>`


        const profileSection = profiles ? `
      <div class="acp-profiles">
        <div id="profileContainer" class="acp-profiles-list"></div>
      </div>
    ` : '';

        const contentSettingsSection = `
      <div class="acp-features">
        <span class="acp-content-text" data-ap-translate="CONTENT SETTINGS">Content Settings</span>
        <div id="contentSettingsContainer" class="acp-features-list"></div>
      </div>
    `;

        const browsingSettingsSection = `
      <div class="acp-features">
        <span class="acp-content-text" data-ap-translate="BROWSING SETTINGS">Browsing Settings</span>
        <div id="browsingSettingsContainer" class="acp-features-list"></div>
      </div>
    `;

        const textAndReadabilitySection = `
      <div class="acp-features">
        <span class="acp-content-text" data-ap-translate="TEXT AND READABILITY">Text and Readability</span>
        <div id="textAndReadabilityContainer" class="acp-features-list"></div>
      </div>
    `;

        const colorAndContrastSection = `
      <div class="acp-features">
        <span class="acp-content-text" data-ap-translate="COLOR AND CONTRAST">Color and Contrast</span>
        <div id="colorAndContrastContainer" class="acp-features-list"></div>
      </div>
    `;

        const navigationAndFocusSection = `
      <div class="acp-features">
        <span class="acp-content-text" data-ap-translate="NAVIGATION AND FOCUS">Navigation and Focus</span>
        <div id="navigationAndFocusContainer" class="acp-features-list"></div>
      </div>
    `;


        const mediaAndMotionSection = `
      <div class="acp-features">
        <span class="acp-content-text" data-ap-translate="MEDIA AND MOTION">Media and Motion</span>
        <div id="mediaAndMotionContainer" class="acp-features-list"></div>
      </div>
    `;

        const languageAndSupportSection = `
      <div class="acp-features">
        <span class="acp-content-text" data-ap-translate="LANGUAGE AND SUPPORT">Language and Support</span>
        <div id="languageAndSupportContainer" class="acp-features-list"></div>
      </div>
    `;


        const widgetHTML = `
      <div class="accesspro asw-menu"> 
        <div class="acp-header-container">
          <div class="acp-header">
            <span class="acp-widget-title-container">
            <span class="acp-widget-title" data-ap-translate="MENU TITLE">Accessibility Options</span>
            ${this.settings.show_open_shortcut ? `
              <span class="acp-widget-title-container-shortcut acp-hidden">
                ${navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'} + Shift + A
              </span>
            ` : ''}
            </span>
            <div role="button" class="acp-close" tabindex="0" aria-label="Close Accessibility Widget">
               <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed"><path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/></svg>  
            </div>
          </div>
          ${!isModernTemplate ? `
            <div class="acp-compliance-reset acp-compliance-reset--header">
              ${missionButton}
              ${resetButton}
            </div>
          ` : ''}
        </div>
        <div class="acp-body">
          ${languageSection}
          ${this.enableMenuSettings?.widgetsize ? `
          <div class="acp-widget-size">
              <div role="button" tabindex="0" class="acp-oversized-widget-button ${this.widgetSize === 'larger' ? 'active' : ''}" id="acp-oversized-widget">
              <span data-ap-translate="OVERSIZED WIDGET">Oversized Widget</span>
              <span class="acp-profile-toggle" style="margin-left: auto;">
                <span class="acp-profile-inner-toggle"></span>
              </span>
            </div>
          </div>
          ` : ''}
          ${this.enableMenuSettings?.keyboardshortcuts ? `
          <div class="acp-shortcuts">
            <div role="button" tabindex="0" class="acp-shortcut-button" id="acp-shortcut-button">
              <span data-ap-translate="KEYBOARD SHORTCUTS">Enable Keyboard Shortcuts</span>
              <span class="acp-profile-toggle" style="margin-left: auto;">
                <span class="acp-profile-inner-toggle"></span>
              </span>
            </div>
          </div>
          ` : ''}
          ${profileSection}
          ${contentSettingsSection}
          ${browsingSettingsSection}
          ${textAndReadabilitySection}
          ${colorAndContrastSection}
          ${navigationAndFocusSection}
          ${mediaAndMotionSection}
          ${languageAndSupportSection}
        </div>
        ${isModernTemplate ? `
          <div class="acp-compliance-reset acp-compliance-reset--footer">
          ${resetButton}
          <div class="acp-compliance-reset-buttons--bottom">
            ${missionButton}
            ${reportAProblem}
            </div>
          </div>
        ` : `
          <div class="acp-compliance-reset">
            ${reportAProblem}
          </div>
        `}
      </div>
      <div id="popoverContainer" class="acp-popover acp-hidden">
        <div class="acp-popover-header">
          <span class="acp-popover-title"></span>
          <div role="button" tabindex="0" class="acp-popover-close" aria-label="Close Popover">
            <svg xmlns="http://www.w3.org/2000/svg" height="19px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed">
              <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/>
            </svg>
          </div>
        </div>
        <div class="acp-popover-content"></div>
      </div>
    `;

        this.container.innerHTML = widgetHTML;
        // this.addMoveWidgetButtons();
        this.addHideWidgetButton();
    }

    makeWidgetDraggable(dragHandleSelector = ".acp-header") {
        const dragHandle = this.container.querySelector(dragHandleSelector);
        const target = this.container;

        if (!dragHandle || !target) return;

        let isDragging = false;
        let startX = 0;
        let startY = 0;
        let startLeft = 0;
        let startTop = 0;

        // Style the drag handle to show it's draggable
        dragHandle.style.cursor = 'move';

        dragHandle.addEventListener('mousedown', (e) => {
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            startLeft = target.offsetLeft;
            startTop = target.offsetTop;
            dragHandle.style.cursor = 'grabbing';
            document.body.style.userSelect = 'none';
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;

            const dx = e.clientX - startX;
            const dy = e.clientY - startY;

            let newLeft = startLeft + dx;
            let newTop = startTop + dy;

            const maxLeft = window.innerWidth - target.offsetWidth;
            const maxTop = window.innerHeight - target.offsetHeight;

            // Clamp the position
            newLeft = Math.max(0, Math.min(newLeft, maxLeft));
            newTop = Math.max(0, Math.min(newTop, maxTop));

            target.style.left = `${newLeft}px`;
            target.style.top = `${newTop}px`;
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                dragHandle.style.cursor = 'move';
                document.body.style.userSelect = '';
            }
        });
    }


    addHideWidgetButton() {
        if (!this.enableMenuSettings.hidewidget) {
            return;
        }

        const hideWidgetButton = document.createElement('div');
        hideWidgetButton.setAttribute('role', 'button');
        hideWidgetButton.setAttribute('tabindex', '0');
        hideWidgetButton.className = 'acp-hide-widget-button';
        hideWidgetButton.innerHTML = `
        ${ACCESSPRO_ICONS.hideIcon}
        <span data-ap-translate="HIDE WIDGET">Hide Widget</span>
    `;

        hideWidgetButton.addEventListener('click', () => {
            const texts = {
                "hideWidget": this.translations?.["HIDE WIDGET"] || "Hide Widget",
                "hideWidgetDesc": this.translations?.["HIDE WIDGET DESC"] || "How long would you like to hide the widget?",
                "forCurrentSession": this.translations?.["FOR CURRENT SESSION"] || "For current session",
                "for24Hours": this.translations?.["FOR 24 HOURS"] || "For 24 hours",
                "forOneWeek": this.translations?.["FOR 7 DAYS"] || "For one week",
                "forever": this.translations?.["FOREVER"] || "Forever (until local storage is cleared)",
            }
            const modal = new AccessProHelpModal({
                id: 'hide-widget-modal',
                title: texts.hideWidget,
                titleTranslationKey: 'HIDE WIDGET',
                contentHTML: `
          <div class="acp-hide-widget-options">
            <span data-ap-translate="HIDE WIDGET DESC">${texts.hideWidgetDesc}</span>
            <select id="hide-duration-select" class="acp-hide-duration-select">
              <option value="session" data-ap-translate="FOR CURRENT SESSION">${texts.forCurrentSession}</option>
              <option value="day" data-ap-translate="FOR 24 HOURS">${texts.for24Hours}</option>
              <option value="week" data-ap-translate="FOR ONE WEEK">${texts.forOneWeek}</option>
              <option value="forever" data-ap-translate="FOREVER">${texts.forever}</option>
            </select>
            <div style="text-align: center; margin-top: 20px;">
              <div role="button" tabindex="0" id="confirm-hide-widget" class="acp-hide-option" data-ap-translate="HIDE WIDGET">${texts.hideWidget}</div>
            </div>
          </div>
        `
            });

            modal.show();

            // Add click handler for hide button
            const confirmButton = document.getElementById('confirm-hide-widget');
            const durationSelect = document.getElementById('hide-duration-select');

            confirmButton.addEventListener('click', () => {
                const duration = durationSelect.value;
                const now = new Date().getTime();

                switch (duration) {
                    case 'session':
                        sessionStorage.setItem('acp-widget-hidden', 'true');
                        break;
                    case 'day':
                        localStorage.setItem('acp-widget-hidden-until', now + (24 * 60 * 60 * 1000));
                        break;
                    case 'week':
                        localStorage.setItem('acp-widget-hidden-until', now + (7 * 24 * 60 * 60 * 1000));
                        break;
                    case 'forever':
                        localStorage.setItem('acp-widget-hidden', 'true');
                        break;
                }

                // Hide the widget icon
                const widgetIcon = document.querySelector('#Access-Pro-Icon');
                if (widgetIcon) {
                    widgetIcon.style.display = 'none';
                }

                // Close the widget and modal
                this.toggleWidget();
                modal.close();
            });
        });

        // Add the button to the widget
        const container = document.querySelector('.acp-body');
        if (container) {
            container.appendChild(hideWidgetButton);
        }
    }

    addMoveWidgetButtons() {
        const moveWidgetButtonsContainer = document.createElement('div');
        moveWidgetButtonsContainer.className = 'acp-move-widget-buttons-container';

        this.iconPosition = localStorage.getItem('acp-widget-position') || this.settings.icon_position;
        this.widgetPosition = this.iconPosition?.includes("L") ? "left" : "right";

        const text = document.createElement('span');
        text.setAttribute('data-ap-translate', 'MOVE WIDGET');
        text.innerHTML = 'Move Widget';
        moveWidgetButtonsContainer.appendChild(text);

        const moveWidgetButtons = document.createElement('div');
        moveWidgetButtons.className = 'acp-move-widget-buttons';

        const moveWidgetToLeftButton = document.createElement('div');
        moveWidgetToLeftButton.setAttribute('role', 'button');
        moveWidgetToLeftButton.setAttribute('tabindex', '0');
        moveWidgetToLeftButton.className = 'acp-move-widget-button';
        moveWidgetToLeftButton.setAttribute('data-ap-translate', 'LEFT');
        moveWidgetToLeftButton.innerHTML = 'Left';

        const moveWidgetToRightButton = document.createElement('div');
        moveWidgetToRightButton.setAttribute('role', 'button');
        moveWidgetToRightButton.setAttribute('tabindex', '0');
        moveWidgetToRightButton.className = 'acp-move-widget-button';
        moveWidgetToRightButton.setAttribute('data-ap-translate', 'RIGHT');
        moveWidgetToRightButton.innerHTML = 'Right';

        // Set initial active class
        if (this.widgetPosition === 'left') {
            moveWidgetToLeftButton.classList.add('acp-active');
        } else {
            moveWidgetToRightButton.classList.add('acp-active');
        }

        moveWidgetButtons.appendChild(moveWidgetToLeftButton);
        moveWidgetButtons.appendChild(moveWidgetToRightButton);
        moveWidgetButtonsContainer.appendChild(moveWidgetButtons);

        const container = document.querySelector('.acp-body');
        if (container) {
            container.appendChild(moveWidgetButtonsContainer);
        }

        const widget = document.querySelector('#acp-widget');
        if (!widget) {
            console.warn('Widget not found: #acp-widget');
            return;
        }

        moveWidgetToLeftButton.addEventListener('click', () => {
            this.widgetPosition = 'left';
            localStorage.setItem('acp-widget-position', 'L');

            widget.style.left = '0px';
            widget.style.right = 'auto';

            moveWidgetToLeftButton.classList.add('acp-active');
            moveWidgetToRightButton.classList.remove('acp-active');
        });

        moveWidgetToRightButton.addEventListener('click', () => {
            this.widgetPosition = 'right';
            localStorage.setItem('acp-widget-position', 'R');

            widget.style.right = '0px';
            widget.style.left = 'auto';

            moveWidgetToLeftButton.classList.remove('acp-active');
            moveWidgetToRightButton.classList.add('acp-active');
        });
    }


    applyStyles({
        widgetSize = 'medium',
        widgetPosition = 'BR',
        customPosition = {}
    } = {}) {
        const widget = document.querySelector('#acp-widget');
        if (!widget) {
            console.error('Widget not found!');
            return;
        }

        // Add widget classes
        const classesToAdd = [
            `acp-widget-${widgetSize}`,
            `asw-menu--${this.template}`,
            `acp-widget--${widgetPosition}`,
            `acp-widget--${this.widgetHeight}`
        ];
        widget.classList.add(...classesToAdd);

        // Default position values
        const top = customPosition.top ? `${customPosition.top}px` : '0px';
        const left = customPosition.left ? `${customPosition.left}px` : '0px';
        const right = customPosition.right ? `${customPosition.right}px` : '0px';
        const bottom = customPosition.bottom ? `${customPosition.bottom}px` : '0px';

        const isPopup = this.widgetHeight === 'popup';

        // Define widget position styles
        const positionStyles = isPopup ? {
            TL: { top, left, bottom: 'auto', right: 'auto' },
            TR: { top, right, bottom: 'auto', left: 'auto' },
            BL: { bottom, left, top: 'auto', right: 'auto' },
            BR: { bottom, right, top: 'auto', left: 'auto' },
            CL: { bottom, left, top: 'auto', right: 'auto' },
            CR: { bottom, right, top: 'auto', left: 'auto' },
            default: { bottom, right, top: 'auto', left: 'auto' },
        } : {
            TL: { top: '0px', left: '0px', bottom: '0px', right: 'auto' },
            TR: { top: '0px', right: '0px', bottom: '0px', left: 'auto' },
            BL: { top: '0px', left: '0px', bottom: '0px', right: 'auto' },
            BR: { top: '0px', right: '0px', bottom: '0px', left: 'auto' },
            CL: { top: '0px', left: '0px', bottom: '0px', right: 'auto' },
            CR: { top: '0px', right: '0px', bottom: '0px', left: 'auto' },
            default: { top: '0px', right: '0px', bottom: '0px', left: 'auto' },
        };

        const widgetPositionStyles = positionStyles[widgetPosition] || positionStyles.default;


        if (localStorage.getItem('acp-widget-position') === 'L') {
            widgetPositionStyles.left = '0px';
            widgetPositionStyles.right = 'auto';
        } else if (localStorage.getItem('acp-widget-position') === 'R') {
            widgetPositionStyles.right = '0px';
            widgetPositionStyles.left = 'auto';
        }

        // Apply position styles
        Object.entries(widgetPositionStyles).forEach(([key, value]) => {
            widget.style[key] = value;
        });

        // Additional styles for non-popup widgets
        if (!isPopup) {
            Object.assign(widget.style, {
                height: '100%',
                maxHeight: '100vh',
                margin: '0',
                borderRadius: '0',
            });
        }
    }

    attachEventListeners() {
        const addEventListener = (selector, event, handler) => {
            const element = this.container.querySelector(selector);
            if (element) {
                element.addEventListener(event, handler);
            }
        };

        addEventListener('.acp-close', 'click', () => this.toggleWidget());
        addEventListener('.acp-compliance', 'click', () => {
            if (this.settings.statement_action === 'redirect') {
                window.location.href = this.settings.statement_redirect_url;
            } else {
                this.renderAccessibilityMission();
            }
        });
        addEventListener('.acp-reset', 'click', () => this.resetWidget());
        addEventListener('#acp-shortcut-button', 'click', () => this.toggleShortcuts());
        addEventListener('#acp-oversized-widget', 'click', () => this.toggleOversizedWidget());
        addEventListener('#acp-report-a-problem', 'click', () => this.renderReportAProblem());

        // add ctrl shift x shortcut in the shortcutsMap to close/open the widget
        this.shortcutsMap.set("Ctrl+Shift+A", () => this.toggleWidget());
        this.shortcutsMap.set("Shift+Ctrl+A", () => this.toggleWidget());

        this.makeWidgetDraggable();
    }

    renderReportAProblem() {
        const url = window.location.href;

        const translations = {
            "REPORT_A_PROBLEM": this.translations?.["REPORT A PROBLEM"] || "Report a Problem",
            "REPORT_A_PROBLEM_DESC": this.translations?.["REPORT A PROBLEM DESC"] || "Help us make this site more accessible. Please describe the problem you’re experiencing.",
            "EMAIL": this.translations?.["EMAIL"] || "Email",
            "PAGE_URL": this.translations?.["PAGE URL"] || "Page URL",
            "ISSUE_CATEGORY": this.translations?.["ISSUE CATEGORY"] || "Issue Category",
            "VISUAL_ISSUE": this.translations?.["VISUAL ISSUE"] || "Visual Issue",
            "KEYBOARD_NAVIGATION": this.translations?.["KEYBOARD NAVIGATION"] || "Keyboard Navigation",
            "SCREEN_READER_COMPATIBILITY": this.translations?.["SCREEN READER COMPATIBILITY"] || "Screen Reader Compatibility",
            "COLOR_CONTRAST": this.translations?.["COLOR CONTRAST"] || "Color Contrast",
            "TEXT_SIZE": this.translations?.["TEXT SIZE"] || "Text Size",
            "OTHER": this.translations?.["OTHER"] || "Other",
            "ASSISTIVE_TECHNOLOGY_USED": this.translations?.["ASSISTIVE TECHNOLOGY USED"] || "Assistive Technology Used",
            "DESCRIPTION": this.translations?.["DESCRIPTION"] || "Description",
            "SUBMIT": this.translations?.["SUBMIT"] || "Submit",
            "SELECT_A_CATEGORY": this.translations?.["SELECT A CATEGORY"] || "Select a category",
            "ASSISTIVE_TECHNOLOGY_USED_PLACEHOLDER": this.translations?.["ASSISTIVE TECHNOLOGY USED PLACEHOLDER"] || "",
            "DESCRIPTION_PLACEHOLDER": this.translations?.["DESCRIPTION PLACEHOLDER"] || "Describe the issue in detail...",
            "THANK_YOU_MESSAGE": this.translations?.["THANK YOU MESSAGE"] || "Thank you for your submission!",
            "ERROR_MESSAGE": this.translations?.["ERROR MESSAGE"] || "An error occurred while submitting the report. Please try again later.",
        }

        this.showPopover(translations.REPORT_A_PROBLEM,
            `
     <div class="acp-report-a-problem-content">
  <p>${translations.REPORT_A_PROBLEM_DESC}</p>
  <form class="acp-report-form" method="post">
    <div class="acp-report-form-row">
      <label for="acp-report-email">${translations.EMAIL}</label>
      <input
        id="acp-report-email"
        name="email"
        type="email"
        placeholder="example@example.com"
        required
      />
    </div>

    <div class="acp-report-form-row">
      <label for="acp-report-url">${translations.PAGE_URL}</label>
      <input
        id="acp-report-url"
        name="url"
        type="url"
        value="${url}" 
        required
      />
    </div>

    <div class="acp-report-form-row">
      <label for="acp-report-category">${translations.ISSUE_CATEGORY}</label>
      <select id="acp-report-category" name="category" required>
        <option value="" data-ap-translate="SELECT A CATEGORY">${translations.ISSUE_CATEGORY}</option>
        <option value="visual" data-ap-translate="VISUAL ISSUE">${translations.VISUAL_ISSUE}</option>
        <option value="keyboard" data-ap-translate="KEYBOARD_NAVIGATION">${translations.KEYBOARD_NAVIGATION}</option>
        <option value="screenreader" data-ap-translate="SCREEN_READER_COMPATIBILITY">${translations.SCREEN_READER_COMPATIBILITY}</option>
        <option value="contrast" data-ap-translate="COLOR_CONTRAST">${translations.COLOR_CONTRAST}</option>
        <option value="text-size" data-ap-translate="TEXT_SIZE">${translations.TEXT_SIZE}</option>
        <option value="other" data-ap-translate="OTHER">${translations.OTHER}</option>
      </select>
    </div>

    <div class="acp-report-form-row">
      <label for="acp-report-tech" data-ap-translate="ASSISTIVE_TECHNOLOGY_USED">${translations.ASSISTIVE_TECHNOLOGY_USED} </label>
      <input
        id="acp-report-tech"
        name="assistiveTech"
        type="text"
        placeholder="${translations.ASSISTIVE_TECHNOLOGY_USED_PLACEHOLDER}"
      />
    </div>

    <div class="acp-report-form-row">
      <label for="acp-report-description" data-ap-translate="DESCRIPTION">${translations.DESCRIPTION}</label>
      <textarea
        id="acp-report-description"
        name="description"
        placeholder="${translations.DESCRIPTION_PLACEHOLDER}"
        required
      ></textarea>
    </div>
    <div>
      <span class="acp-report-form-error" style="color: red;"></span>
      <span class="acp-report-form-success" style="color: green;"></span>
    </div>

    <button type="submit" data-ap-translate="SUBMIT">${translations.SUBMIT}</button>
  </form>
</div>

      `,
            false,
            "REPORT A PROBLEM"
        );

        const form = document.querySelector('.acp-report-form');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const submitButton = form.querySelector('button[type="submit"]');
                try {
                    submitButton.disabled = true;
                    submitButton.innerHTML = 'Submitting...';
                    const formData = new FormData(form);
                    const email = formData.get('email');
                    const description = formData.get('description');
                    const url = formData.get('url');
                    const category = formData.get('category');
                    const assistiveTech = formData.get('assistiveTech');

                    const res = await fetch(`${accessProProxyHandle}/support/report/`, {
                        method: 'POST',
                        body: JSON.stringify({ email, description, page_url: url, issue_category: category, assistive_tech_used: assistiveTech }),
                        headers: {
                            'Content-Type': 'application/json',
                        }
                    });
                    const data = await res.json();
                    if (data.success) {
                        const successMessage = form.querySelector('.acp-report-form-success');
                        if (successMessage) {
                            successMessage.innerHTML = translations.THANK_YOU_MESSAGE;
                        }
                    } else {
                        const errorMessage = form.querySelector('.acp-report-form-error');
                        if (errorMessage) {
                            errorMessage.innerHTML = translations.ERROR_MESSAGE;
                        }
                    }

                } catch (error) {
                    console.error(error);
                    const errorMessage = form.querySelector('.acp-report-form-error');
                    if (errorMessage) {
                        errorMessage.innerHTML = translations.ERROR_MESSAGE;
                    }
                } finally {
                    submitButton.disabled = false;
                    submitButton.innerHTML = translations.SUBMIT;
                    // clear the form
                    form.reset();
                }
            });
        }
    }



    addFeature(feature, container) {
        this.features.push(feature);
        accessProFeatures.push(feature);
        feature.render(container, this.translations);
    }

    addProfile(profile, content) {
        this.profiles.push(profile);
        profile.render(content);
    }

    addLanguage(language) {
        if (!language) {
            return;
        }

        const langInstance = new AccessProLanguage(language, this);
        this.languages.push(langInstance);
        langInstance.render(document.getElementById('languageContainer'));

        langInstance.onChange = () => {
            this.languages.forEach(lang => lang.setActive(false));
            langInstance.setActive(true);
            this.setActiveLanguage(langInstance);
            localStorage.setItem('acp-active-language', langInstance.code);

            // dispatch a custom event to notify the change
            const event = new CustomEvent('acplanguageChanged', {
                detail: { language: langInstance.code }
            });

            window.dispatchEvent(event);
        };
    }

    applySavedLanguage(lang, load = true) {
        const savedLanguageCode = lang || localStorage.getItem('acp-active-language') || this.defaultLanguage;
        if (savedLanguageCode) {
            const savedLanguage = this.languages.find(lang => lang.code === savedLanguageCode);
            if (savedLanguage) {
                savedLanguage.setActive(true);
                this.setActiveLanguage(savedLanguage, load)
            }
        }
    }

    setActiveLanguage(languageInstance, load = false) {
        if (this.activeLanguage) {
            this.activeLanguage.setActive(false);
        }



        this.activeLanguage = languageInstance;
        this.language = languageInstance.code;
        languageInstance.setActive(true);



        function translateText(translations) {
            Object.keys(translations).forEach(key => {
                const elements = document.querySelectorAll(`[data-ap-translate="${key}"]`);
                elements.forEach(el => {
                    el.innerHTML = translations[key];
                });
            });
        }

        if (load && languageInstance.code === "en") {
        } else {
            fetch(accessProTranslationUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    translateTo: languageInstance.code,
                })
            }).then(res => res.json()).then(data => {
                this.translations = data?.data;
                accessProTranslations = data?.data;
                translateText(data?.data);
            }).catch(err => console.error(err));
        }

        const translationCollapsibleHeader = document.querySelector('.acp-language-collapsible-header');

        if (translationCollapsibleHeader) {
            translationCollapsibleHeader.querySelector('.acp-language-collapsible-title').innerText = `${languageInstance.name} (${languageInstance.code?.toUpperCase()})`;
            translationCollapsibleHeader.querySelector('.acp-language-collapsible-icon').src = languageInstance.flag;
        }

        if (!load) {
            aswFeaturesUsageUpdate('language');
        }
    }

    showPopover(title, content, isHTMLElement = false, titleTranslationKey = null) {
        const popoverContainer = this.container.querySelector('#popoverContainer');
        const popoverContent = popoverContainer.querySelector('.acp-popover-content');
        const popoverTitle = popoverContainer.querySelector('.acp-popover-title');

        if (popoverTitle) {
            popoverTitle.innerText = title;
        }

        if (titleTranslationKey) {
            popoverTitle.setAttribute('data-ap-translate', titleTranslationKey);
        }

        if (popoverContainer && popoverContent) {
            if (isHTMLElement) {
                popoverContent.innerHTML = '';
                popoverContent.appendChild(content);
            } else {
                popoverContent.innerHTML = content;
            }
            popoverContainer.classList.remove('acp-hidden');
        }


        const allElementsWithTranslate = popoverContainer.querySelectorAll('[data-ap-translate]');
        allElementsWithTranslate.forEach(element => {
            const key = element.getAttribute('data-ap-translate');
            if (this.translations[key]) {
                element.innerHTML = this.translations[key];
            }
        });

    }

    toggleOversizedWidget() {
        const toggleButton = document.querySelector('#acp-oversized-widget');
        const classList = ["acp-widget-small", "acp-widget-large", "acp-widget-larger"];
        const isEnabled = toggleButton.classList.contains('active');


        if (isEnabled) {
            toggleButton.classList.remove('active');

        } else {
            toggleButton.classList.add('active');
        }


        const widgetContainer = document.querySelector('#acp-widget');
        if (widgetContainer) {
            // Remove all size classes
            classList.forEach(sizeClass => {
                widgetContainer.classList.remove(sizeClass);
            });

            const newSize = isEnabled ? this.defaultWidgetSize === "large" ? "large" : "small" : "larger"

            widgetContainer.classList.add(`acp-widget-${newSize}`);
            localStorage.setItem('acp-widget-size', newSize);
        }
    }



    hidePopover() {
        const popoverContainer = this.container.querySelector('#popoverContainer');
        if (popoverContainer) {
            popoverContainer.classList.add('acp-hidden');
        }
    }

    attachPopoverListeners() {
        const popoverClose = this.container.querySelector('.acp-popover-close');
        if (popoverClose) {
            popoverClose.addEventListener('click', () => this.hidePopover());
        }
    }

    toggleWidget() {
        this.isOpen = !this.isOpen;
        this.widgetContainer = document.querySelector('#acp-widget');
        if (this.widgetContainer) {
            this.widgetContainer.classList.toggle('acp-open', this.isOpen);
            if (this.isOpen) {
                localStorage.setItem('acp-widget-opened', 'true');
            }
        }
        // Send analytics
        if (this.isOpen) {
            aswFeaturesUsageUpdate('widget-open');
        } else {
            aswFeaturesUsageUpdate('widget-close');
        }
    }

    renderAccessibilityMission() {
        const title = this.complianceData?.compliance_title || 'Accessibility Statement';
        const content = this.complianceData?.compliance_content || `
        <div class="acp-popover-content"><div class="ap-compliance-main-title"><strong>AccessPro Compliance Mission Statement</strong></div> <div class="ap-compliance-list-wrapper"><div class="ap-compliance-list-item">• <strong>WCAG 2.2 Commitment:</strong> We strictly adhere to WCAG 2.2 AA guidelines.</div><div class="ap-compliance-list-item">• <strong>Personalized UI:</strong> Users with disabilities can personalize the interface.</div><div class="ap-compliance-list-item">• <strong>AI-Based Compliance:</strong> We use AI to maintain accessibility during updates.</div><div class="ap-compliance-list-item">• <strong>ARIA Attributes:</strong> Meaningful data for screen-readers using ARIA attributes.</div> </div> <div class="ap-compliance-list-wrapper"><div class="ap-compliance-list-title"><strong>Optimized Screen Reader and Keyboard Navigation:</strong></div><div class="ap-compliance-list"><div class="ap-compliance-list-item">• <strong>Screen-reader Optimization:</strong> ARIA attributes for meaningful data.</div> <div class="ap-compliance-list-item">• <strong>Image Description:</strong> Auto image descriptions for better understanding.</div> <div class="ap-compliance-list-item">• <strong>OCR Technology:</strong> Text extraction from images.</div> <div class="ap-compliance-list-item">• <strong>Keyboard Navigation:</strong> Enhanced keyboard operability. </div><div class="ap-compliance-list-item">• <strong>Content-skip Menus:</strong> Easy navigation with shortcuts.</div><div class="ap-compliance-list-item">• <strong>Popup Handling:</strong> Improved handling of popups.</div><div class="ap-compliance-list-item">• <strong>Shortcuts:</strong> Quick access to key elements with shortcuts.</div></div> </div> <div class="ap-compliance-list-wrapper"><div class="ap-compliance-list-title"><strong>Specialized Profiles for Disabilities:</strong></div><div class="ap-compliance-list"><div class="ap-compliance-list-item">• <strong>Epilepsy Safe Profile:</strong> Safe browsing with reduced triggers.</div><div class="ap-compliance-list-item">• <strong>Vision Impaired Profile:</strong> Enhanced interface for visual impairments.</div> <div class="ap-compliance-list-item">• <strong>Cognitive Disability Profile:</strong> Assistive features for cognitive disabilities.</div> <div class="ap-compliance-list-item">• <strong>ADHD-Friendly Profile:</strong> Minimized distractions for ADHD users.</div><div class="ap-compliance-list-item">• <strong>Blind Users Profile:</strong> Compatibility with popular screen-readers.</div><div class="ap-compliance-list-item">• <strong>Keyboard Navigation Profile:</strong> Navigate with keyboard commands.</div></div> </div> <div class="ap-compliance-list-wrapper"><div class="ap-compliance-list-title"><strong>Customizable User Interface Adjustments:</strong></div><div class="ap-compliance-list"><div class="ap-compliance-list-item">• <strong>Font Adjustments:</strong> Customize font settings for readability.</div><div class="ap-compliance-list-item">• <strong>Colour Adjustments:</strong> Choose contrast profiles and color schemes.</div><div class="ap-compliance-list-item">• <strong>Animations:</strong> Disable animations for user safety.</div><div class="ap-compliance-list-item">• <strong>Content Highlighting:</strong> Emphasize key elements.</div><div class="ap-compliance-list-item">• <strong>Audio Muting:</strong> Instantly mute the website.</div><div class="ap-compliance-list-item">• <strong>Cognitive Disorders:</strong> Linked search engine for better understanding.</div><div class="ap-compliance-list-item">• <strong>Additional Functions:</strong> Various customizable options.</div></div> </div> <div class="ap-compliance-list-wrapper"><div class="ap-compliance-list-title"><strong>Browser and Assistive Technology Support:</strong></div><div class="ap-compliance-list"><div class="ap-compliance-list-item">• <strong>Supported Browsers:</strong> Google Chrome, Mozilla Firefox, Apple Safari, Opera, Microsoft Edge.</div><div class="ap-compliance-list-item">• <strong>Supported Screen Readers:</strong> JAWS (Windows/MAC), NVDA (Windows/MAC).</div></div> </div> <div class="ap-compliance-list-wrapper"><div class="ap-compliance-list-title"><strong>Continual Accessibility Improvement:</strong></div><div class="ap-compliance-list"> <div class="ap-compliance-list-item">• <strong>Ongoing Efforts:</strong> We continuously enhance accessibility. </div> <div class="ap-compliance-list-item">• <strong>Goal:</strong> Achieve maximum accessibility with evolving technology.</div><div class="ap-compliance-list-item">• <strong>Contact Us:</strong> Reach out via the website’s contact form for queries or concerns.</div></div> </div></div>`
        this.showPopover(title, content);
    }

    resetWidget() {
        localStorage.removeItem('acp-widget-opened');
        this.features.forEach(feature => {
            feature.reset();
        });

        // Reset the profiles
        this.profiles.forEach(profile => {
            profile.reset();
        });


        if (localStorage.getItem('acp-active-language') && localStorage.getItem('acp-active-language') !== this.defaultLanguage) {
            this.applySavedLanguage(this.defaultLanguage, false);
            // dispatch language changed event
            window.dispatchEvent(new CustomEvent('acplanguageChanged', { detail: { language: this.defaultLanguage } }));
        }

        // Disable the shortcuts
        this.disableShortcuts();

        // Reset the widget size
        const widgetSize = this.settings?.widget_size || 'medium';
        const widgetContainer = document.querySelector('#acp-widget');
        if (widgetContainer) {
            // Remove all size classes
            const classList = ["acp-widget-small", "acp-widget-large", "acp-widget-larger"];
            classList.forEach(sizeClass => {
                widgetContainer.classList.remove(sizeClass);
            });
            widgetContainer.classList.add(`acp-widget-${widgetSize}`);

            // handle oversized widget
            const isOverSizedWidgetEnabled = document.querySelector('#acp-oversized-widget')?.classList.contains('active');
            if (isOverSizedWidgetEnabled && this.defaultWidgetSize !== "larger") {
                this.toggleOversizedWidget();
            }

        }

        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('acp-') || key.startsWith('accesspro-')) {
                localStorage.removeItem(key);
            }
        });

    }

    addLanguageCollapsible() {
        const languageCollapsibleTitle = `
        <div class="acp-language-collapsible-header">
            <img src='' alt='Language' class='acp-language-collapsible-icon'/>
            <span class="acp-language-collapsible-title">Language</span>
        </div>`;

        const languageCollapsible = new AccessProCollapsible(languageCollapsibleTitle, 'languageContainer');
        languageCollapsible.render(document.getElementById('languageWrapper'));
    }


    enableShortcuts() {
        this.shortCutsEnabled = true;
        this.updateShortcuts(this.features, true);
        this.updateShortcuts(this.profiles, true);

        // Add the classname `acp-active` to the button
        const shortCutButton = this.container.querySelector('#acp-shortcut-button');
        if (shortCutButton) {
            shortCutButton.classList.add('active');
        }

        const headerShortCut = this.container.querySelector('.acp-widget-title-container-shortcut');
        if (headerShortCut) {
            headerShortCut.classList.remove('acp-hidden');
        }

        // Add event listener for keyboard shortcuts
        window.addEventListener('keydown', this.handleShortcut);
    }

    disableShortcuts() {
        this.shortCutsEnabled = false;
        this.updateShortcuts(this.features, false);
        this.updateShortcuts(this.profiles, false);

        // Remove the classname `acp-active` from the button
        const shortCutButton = this.container.querySelector('#acp-shortcut-button');
        if (shortCutButton) {
            shortCutButton.classList.remove('active');
        }

        const headerShortCut = this.container.querySelector('.acp-widget-title-container-shortcut');
        if (headerShortCut) {
            headerShortCut.classList.add('acp-hidden');
        }

        // Remove event listener for keyboard shortcuts
        window.removeEventListener('keydown', this.handleShortcut);
    }

    toggleShortcuts() {
        localStorage.setItem('acp-shortcuts-enabled', !this.shortCutsEnabled);
        this.shortCutsEnabled ? this.disableShortcuts() : this.enableShortcuts();
        checkIfAnyFeatureActive();
    }

    updateShortcuts(items, enable) {
        items.forEach(item => {
            const element = item.element;
            if (!element) return;

            if (enable) {
                let shortCutKeys = this.formatShortcutKeys(item.shortCutKeys || []);
                if (!shortCutKeys) return;

                element.classList.add('acp-shortcut-enabled');

                const shortcutElement = document.createElement('span');
                shortcutElement.innerText = shortCutKeys;
                shortcutElement.classList.add('acp-shortcut-icon');
                element.appendChild(shortcutElement);

                // Register the shortcut and its action
                let shortcutKey = item.shortCutKeys.join('+');

                if (shortcutKey.includes(";")) {
                    shortcutKey = shortcutKey.replace(";", "Semicolon");
                }
                else if (shortcutKey.includes(".")) {
                    shortcutKey = shortcutKey.replace(".", "Period");
                }
                else if (shortcutKey.includes(",")) {
                    shortcutKey = shortcutKey.replace(",", "Comma");
                }
                else if (shortcutKey.includes("/")) {
                    shortcutKey = shortcutKey.replace("/", "Slash");
                } else if (shortcutKey.includes("'")) {
                    shortcutKey = shortcutKey.replace("'", "Quote");
                }


                this.shortcutsMap.set(shortcutKey, () => this.executeShortcutAction(item));
            } else {
                element.classList.remove('acp-shortcut-enabled');

                const shortcutElement = element.querySelector('.acp-shortcut-icon');
                if (shortcutElement) {
                    element.removeChild(shortcutElement);
                }

                // Unregister the shortcut
                const shortcutKey = item.shortCutKeys.join('+');
                this.shortcutsMap.delete(shortcutKey);
            }
        });
    }

    formatShortcutKeys(shortcut) {
        if (!shortcut || shortcut.length === 0) return null;
        const isMacOs = navigator?.platform.toUpperCase().indexOf('MAC') >= 0;

        return shortcut
            .map(key => {
                if (key === ' ') return 'Space';
                if (key === 'Alt' && isMacOs) return 'OPTION';
                if (typeof key === 'string' && key.length > 1) return key.toUpperCase();
                return key;
            })
            .join('+');
    }

    handleShortcut = event => {
        if (!this.shortCutsEnabled) return;
        const pressedKey = this.getPressedKey(event);

        const action = this.shortcutsMap.get(pressedKey);

        if (action) {
            action(); // Execute the registered action
            event.preventDefault(); // Prevent default browser behavior
        }
    };

    getPressedKey(event) {
        const keys = [];
        if (event.ctrlKey) keys.push('Ctrl');
        if (event.altKey) keys.push('Alt');
        if (event.shiftKey) keys.push('Shift');
        if (event.metaKey) keys.push('Ctrl');

        keys.push(event.key === ' ' ? 'Space' : event.code?.replace('Key', '')?.replace('Digit', ''));
        return keys.join('+');
    }

    executeShortcutAction(item) {
        if (item.toggle) {
            item.toggle();
        }
    }
}
class AccessProFeature {
    constructor(name, icon, localStorageKey, translationKey, featureUsageKey, shortCutKeys) {
        this.name = name;
        this.icon = icon;
        this.localStorageKey = localStorageKey;
        const savedState = localStorage.getItem(this.localStorageKey);
        this.isActive = savedState === 'true';
        this.translationKey = translationKey;
        this.featureUsageKey = featureUsageKey;
        this.shortCutKeys = shortCutKeys || [];
    }


    toggle() {
        this.isActive = !this.isActive;
        if (this.isActive) {
            this.activate();
        } else {
            this.deactivate();
        }
    }

    render(container) {
        this.element = document.createElement('div');
        this.element.setAttribute('role', 'button');
        this.element.setAttribute('tabindex', '0');
        this.element.className = 'acp-feature-button';
        this.element.addEventListener('click', () => this.toggle());

        const featureIcon = document.createElement("span");
        featureIcon.innerHTML = this.icon;
        featureIcon.classList.add('acp-feature-icon');
        this.element.appendChild(featureIcon);

        const featureText = document.createElement("span");
        featureText.innerText = this.name;
        featureText.classList.add('acp-feature-text');
        featureText.setAttribute('data-ap-translate', this.translationKey);
        this.element.appendChild(featureText);

        container.appendChild(this.element);
        this.updateUI();

        if (this.isActive) {
            this.activate(true);
        }
    }


    activate(load = false) {
        this.isActive = true;
        localStorage.setItem(this.localStorageKey, 'true');
        this.updateUI();
        if (!load) {
            this.sendAnalytics();
        }
        /* Will be implemented in child classes */
    }

    deactivate(load = false) {
        this.isActive = false;
        localStorage.setItem(this.localStorageKey, 'false');
        this.updateUI();
        if (!load) {
            this.sendAnalytics();
        }
        /* Will be implemented in child classes */
    }

    updateUI() {
        if (this.element) {
            this.element.classList.toggle('active', this.isActive);
            // this.visuallyHiddenElement.innerText = this.isActive ? 'Activated' : ' Not Activated';
        }
        // dispatch a custom event to notify the change
        const event = new CustomEvent('acpFeatureToggled', {
            detail: { feature: this.name, state: this.isActive }
        });
        window.dispatchEvent(event);
    }

    reset() {
        this.deactivate(true);
    }

    async sendAnalytics() {
        if (this.featureUsageKey) {
            await aswFeaturesUsageUpdate(this.featureUsageKey);
        }
    }
}

class AccessProColorsFeature extends AccessProFeature {
    constructor(name, icon, localStorageKey, translationKey, featureUsageKey, shortCutKeys, colorSets) {
        super(name, icon, localStorageKey, translationKey, featureUsageKey, shortCutKeys);
        this.colorSets = colorSets || [
            { code: "#0076B4", name: "Blue" },
            { code: "#7A549C", name: "Purple" },
            { code: "#C83733", name: "Red" },
            { code: "#D07021", name: "Orange" },
            { code: "#26999F", name: "Teal" },
            { code: "#4D7831", name: "Green" },
            { code: "#ffffff", name: "White" },
            { code: "#000000", name: "Black" },
        ];

        this.colorTargets = [
            { title: "Title", target: "title", translationKey: "TITLE" },
            { title: "Content", target: "content", translationKey: "CONTENT" },
            { title: "Background", target: "background", translationKey: "BACKGROUND" },
        ];

        this.selectedColors = {
            content: this.getStoredColor("content"),
            background: this.getStoredColor("background"),
            title: this.getStoredColor("title"),
        };

        // check if any color is selected
        const isAnyColorSelected = Object.values(this.selectedColors).some(color => color !== null);
        if (isAnyColorSelected) {
            this.isActive = true;
        }

        this.initializeTargets();
    }

    initializeTargets() {
        const allTitles = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        allTitles.forEach(title => title.setAttribute('data-ap-target', 'title'));

        const allContent = document.querySelectorAll('p, span, a, li, button');
        allContent.forEach(content => content.setAttribute('data-ap-target', 'content'));

        const allBackground = document.querySelectorAll('body, section, div, header, footer');
        allBackground.forEach(background => {
            if (!background.style.backgroundImage) {
                background.setAttribute('data-ap-target', 'background');
            }
        });

        // Apply stored colors
        Object.keys(this.selectedColors).forEach(target => {
            if (this.selectedColors[target]) {
                this.applyColor(target, this.selectedColors[target]);
            }
        });
    }


    render(container) {
        const mainContainer = document.createElement('div');
        mainContainer.className = 'acp-feature-button acp-colors-feature acp-feature-full';

        const featureTitle = document.createElement('span');
        featureTitle.innerText = this.name;
        featureTitle.className = 'acp-feature-text';
        featureTitle.setAttribute('data-ap-translate', this.translationKey);
        mainContainer.appendChild(featureTitle);

        this.colorTargets.forEach(target => {
            const colorContainer = document.createElement('div');
            colorContainer.className = 'acp-colors-feature-item';

            const title = document.createElement('span');
            title.className = 'acp-colors-title';
            title.setAttribute('data-ap-translate', target.translationKey);
            title.innerText = target.title;
            colorContainer.appendChild(title);

            const colorsItems = document.createElement('div');
            colorsItems.className = 'acp-colors-items';

            this.colorSets.forEach(color => {
                const colorItem = document.createElement('div');
                colorItem.setAttribute('role', 'button');
                colorItem.setAttribute('tabindex', '0');
                colorItem.className = 'acp-color-circle';
                colorItem.style.backgroundColor = color.code;
                colorItem.style.borderColor = color.code;
                colorItem.setAttribute('title', `Change ${target.title} color to ${color.name}`);
                colorItem.setAttribute('aria-label', `Change ${target.title} color to ${color.name}`);

                if (this.selectedColors[target.target] === color.code) {
                    colorItem.classList.add('acp-selected');
                }

                colorItem.addEventListener('click', () => {
                    // If the color is already selected, reset it
                    if (this.selectedColors[target.target] === color.code) {
                        colorItem.classList.remove('acp-selected');
                        this.changeColor(null, target.target, colorItem, colorsItems);
                        if (colorsItems) {
                            colorsItems.querySelectorAll('.acp-color-circle').forEach(btn => btn.classList.remove('acp-selected'));
                        }
                        return;
                    }
                    this.changeColor(color.code, target.target, colorItem, colorsItems)
                });
                colorsItems.appendChild(colorItem);
            });

            const resetButton = document.createElement('div');
            resetButton.setAttribute('role', 'button');
            resetButton.setAttribute('tabindex', '0');
            resetButton.className = 'acp-color-circle acp-color-reset';
            resetButton.innerHTML = ACCESSPRO_ICONS.xMark;
            resetButton.setAttribute('aria-label', `Reset ${target.title} color`);
            resetButton.setAttribute('title', `Reset ${target.title} color`);
            resetButton.addEventListener('click', () => this.changeColor(null, target.target, null, colorsItems));
            colorsItems.appendChild(resetButton);

            colorContainer.appendChild(colorsItems);
            mainContainer.appendChild(colorContainer);
        });

        container.appendChild(mainContainer);
    }

    changeColor(color, type, selectedButton, colorsItems) {
        this.selectedColors[type] = color;
        this.storeColor(type, color);
        this.applyColor(type, color);
        // Highlight selected button
        if (colorsItems) {
            colorsItems.querySelectorAll('.acp-color-circle').forEach(btn => btn.classList.remove('acp-selected'));
            if (selectedButton) {
                selectedButton.classList.add('acp-selected');
            }
        }
    }

    applyColor(target, color) {
        const targetElements = document.querySelectorAll(`[data-ap-target="${target}"]`);
        targetElements.forEach(element => {
            element.style[target === 'background' ? 'backgroundColor' : 'color'] = color;
        });

        this.isActive = true;

        // dispatch a custom event to notify the change
        const event = new CustomEvent('acpFeatureToggled', {
            detail: { target, color }
        });
        window.dispatchEvent(event);

    }

    resetColors() {
        this.selectedColors = { content: null, background: null, title: null };
        ['content', 'background', 'title'].forEach(target => {
            this.storeColor(target, null);
            const targetElements = document.querySelectorAll(`[data-ap-target="${target}"]`);
            targetElements.forEach(el => {
                el.style.color = '';
                el.style.backgroundColor = '';
            });
        });

        this.isActive = false;
        const event = new CustomEvent('acpFeatureToggled', {
            detail: { target: 'reset', color: null }
        });
        window.dispatchEvent(event);

    }

    storeColor(type, color) {
        localStorage.setItem(`acp-${type}`, color);
    }

    getStoredColor(type) {
        return localStorage.getItem(`acp-${type}`);
    }

    reset() {
        this.resetColors();
        // Remove the selected class from all color buttons
        document.querySelectorAll('.acp-color-circle').forEach(btn => btn.classList.remove('acp-selected'))
    }
}

class AccessProLinkNavigatorFeature {
    // This class will display all the links in the page in select and navigate to the selected link
    constructor(name, icon, localStorageKey, translationKey, featureUsageKey, shortCutKeys) {
        this.name = name;
        this.icon = icon;
        this.localStorageKey = localStorageKey;
        this.translationKey = translationKey;
        this.featureUsageKey = featureUsageKey;
        this.shortCutKeys = shortCutKeys || [];
        this.links = [];
        this.currentIndex = 0;
        this.isActive = false;
    }

    toggle() {
        // No need to toggle the feature
    }

    render(container) {
        this.element = document.createElement('div');
        this.element.setAttribute('role', 'button');
        this.element.setAttribute('tabindex', '0');
        this.element.className = 'acp-feature-button acp-link-navigator acp-feature-full';

        this.elementHeading = document.createElement('span');
        this.elementHeading.className = 'acp-feature-heading';

        const featureIcon = document.createElement("span");
        featureIcon.innerHTML = this.icon;
        featureIcon.classList.add('acp-feature-icon');

        this.featureText = document.createElement("span");
        this.featureText.innerText = accessProTranslations[this.translationKey] || this.name;
        this.featureText.classList.add('acp-feature-text');
        this.featureText.setAttribute('data-ap-translate', this.translationKey);

        this.elementHeading.appendChild(featureIcon);
        this.elementHeading.appendChild(this.featureText);

        // container.appendChild(this.element);
        this.element.appendChild(this.elementHeading);
        container.appendChild(this.element);

        // Get all the links in the page
        this.links = Array.from(document.querySelectorAll('a'))
            .filter(link => link.href && !link.href.startsWith('javascript:') && link.href !== window.location.href)
            .map(link => {
                return {
                    text: link.innerText || "No Text",
                    href: link.href,
                };
            });


        this.renderLinkNavigator();
    }

    renderLinkNavigator() {
        const linkNavigator = document.createElement('div');
        linkNavigator.className = 'acp-link-navigator';

        const select = document.createElement('select');
        select.className = 'acp-link-navigator-select';

        // Add a placeholder option at the beginning
        const placeholderOption = document.createElement('option');
        placeholderOption.value = '';
        placeholderOption.innerText = 'Select a link to navigate';
        placeholderOption.setAttribute("data-ap-translate", "SELECT LINK");
        placeholderOption.disabled = true; // Make it unselectable
        placeholderOption.selected = true; // Make it selected by default
        select.appendChild(placeholderOption);

        // Add options for each link
        this.links.forEach((link, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.innerText = link.text;
            select.appendChild(option);
        });

        // Add an event listener for navigation
        select.addEventListener('change', () => {
            if (select.value !== '') {
                this.navigateToLink(select.value);
            }
        });

        linkNavigator.appendChild(select);
        this.element.appendChild(linkNavigator);
    }


    navigateToLink(index) {
        const link = this.links[index];
        if (link) {
            window.location.href = link.href;
        }
    }

    activate() {
        // No need to activate the feature
    }

    deactivate() {
        // No need to deactivate the feature
    }

    reset() {
        // No need to reset the feature
    }

    updateUI() {
        // No need to update the UI
    }
}


class AccessProMultiStepFeature {
    constructor(name, icon, states, localStorageKey, translationKey, featureUsageKey, hasOldUI = false, shortCutKeys) {
        this.name = name;
        this.icon = icon;
        this.states = states;
        this.localStorageKey = localStorageKey;
        this.translationKey = translationKey;
        this.featureUsageKey = featureUsageKey;
        this.hasOldUI = hasOldUI && accessProTemplate === 'default';
        this.translations = {};
        this.shortCutKeys = shortCutKeys || [];
        this.isActive = false;

        // Load saved state from localStorage
        const savedState = localStorage.getItem(this.localStorageKey)
        this.currentState = states.find(state => state.value == savedState)
        if (!this.currentState) {
            this.currentState = states[0];
        }
        this.currentStateValue = this.currentState.value;
        this.currentStateIndex = this.states.findIndex(state => state.value === this.currentStateValue);
        if (this.currentStateIndex !== 0) {
            this.onChangeState(this.currentStateValue, true);
        }

        // if (this.shortCutKeys && this.shortCutKeys.length > 0) {
        //   // Add event listener for the shortcut key
        //   document.addEventListener('keydown', (event) => {

        //     if (this.shortCutKeys.includes("Alt")) {
        //       if (event.altKey) {
        //         const remainingKey = this.shortCutKeys.filter(key => key !== "Alt");

        //         if (remainingKey.length === 0) {
        //           this.toggle();
        //         } else {
        //           const remainingKeyCode = "Key" + remainingKey[0]?.toUpperCase();
        //           if (event.code === remainingKeyCode) {
        //             this.toggle();
        //           }
        //         }

        //       }
        //     }

        //   });
        // }

    }

    toggle() {
        this.currentStateIndex = (this.currentStateIndex + 1) % this.states.length;
        const currentState = this.states[this.currentStateIndex];
        this.onChangeState(currentState?.value);
        localStorage.setItem(this.localStorageKey, currentState?.value);
        this.updateUI();
    }

    reset() {
        this.currentStateIndex = 0;
        const currentState = this.states[this.currentStateIndex];
        this.onChangeState(currentState?.value, true);
        localStorage.setItem(this.localStorageKey, currentState?.value);
        this.updateUI();
        this.isActive = false;
    }

    onChangeState(state, load = false) {
        this.currentStateValue = state;
        this.currentStateIndex = this.states.findIndex(stateObj => stateObj.value === state);
        localStorage.setItem(this.localStorageKey, state);
        if (!load) {
            this.sendAnalytics();
        }


        if (state === "normal" || state === "1") {
            this.isActive = false;
        } else {
            this.isActive = true;
        }

        // dispatch a custom event to notify the change
        const event = new CustomEvent('acpFeatureToggled', {
            detail: { feature: this.name, state: this.isActive }
        });
        window.dispatchEvent(event);

        /* Will be implemented in child classes */
    }

    render(container) {
        if (this.hasOldUI) {
            this.renderOldUI(container);
            return;
        }
        this.element = document.createElement("div");
        this.element.setAttribute("role", "button");
        this.element.setAttribute("tabindex", "0");
        this.element.className = "acp-feature-button";
        this.element.addEventListener("click", () => this.toggle());

        this.element.classList.add("acp-feature-button--multi-step");

        const featureIcon = document.createElement("span");
        featureIcon.innerHTML = this.icon;
        featureIcon.classList.add("acp-feature-icon");
        this.element.appendChild(featureIcon);

        this.featureText = document.createElement("span");
        this.featureText.innerText = accessProTranslations[this.translationKey] || this.name;
        this.featureText.classList.add("acp-feature-text");
        this.featureText.setAttribute("data-ap-translate", this.translationKey);
        this.element.appendChild(this.featureText);

        // this.visuallyHiddenElement = document.createElement("span");
        // this.visuallyHiddenElement.innerText = this.isActive ? 'Activated' : 'Not Activated';
        // this.visuallyHiddenElement.classList.add('acp-visually-hidden');

        this.stepsDots = document.createElement("div");
        this.stepsDots.classList.add("acp-steps-dots");
        this.states.forEach((state, index) => {
            const dot = document.createElement("span");
            dot.classList.add("acp-steps-dot");
            dot.classList.toggle("active", index === this.currentStateIndex);
            this.stepsDots.appendChild(dot);
        });

        this.element.appendChild(this.stepsDots);

        // this.element.appendChild(this.visuallyHiddenElement);

        container.appendChild(this.element);

        this.updateUI();
    }


    renderOldUI(container) {
        this.element = document.createElement("div");
        this.element.className = "acp-feature-button acp-feature-button--old";
        this.element.style.gridColumn = "span 2";
        // this.element.addEventListener("click", () => this.toggle());

        const iconTitleWrapper = document.createElement("div");
        iconTitleWrapper.classList.add("acp-feature-icon-title");
        iconTitleWrapper.style.display = 'flex';
        iconTitleWrapper.style.alignItems = 'center';
        iconTitleWrapper.style.gap = '10px';


        const featureIcon = document.createElement("span");
        featureIcon.innerHTML = this.icon;
        featureIcon.classList.add("acp-feature-icon");
        // this.element.appendChild(featureIcon);
        iconTitleWrapper.appendChild(featureIcon);

        this.featureText = document.createElement("span");
        this.featureText.innerText = accessProTranslations[this.translationKey] || this.name;
        this.featureText.classList.add("acp-feature-text");
        this.featureText.setAttribute("data-ap-translate", this.translationKey);
        // this.element.appendChild(this.featureText);
        iconTitleWrapper.appendChild(this.featureText);

        this.element.appendChild(iconTitleWrapper);

        // this.visuallyHiddenElement = document.createElement("span");
        // this.visuallyHiddenElement.innerText = this.isActive ? 'Activated' : 'Not Activated';
        // this.visuallyHiddenElement.classList.add('acp-visually-hidden');

        this.stepsDots = document.createElement("div");
        this.stepsDots.classList.add("acp-steps-dots");
        this.states.forEach((state, index) => {
            const dot = document.createElement("span");
            dot.classList.add("acp-steps-dot");
            dot.classList.toggle("active", index === this.currentStateIndex);
            this.stepsDots.appendChild(dot);
        });


        this.steps = document.createElement("div");
        this.steps.classList.add("acp-feature-steps");
        this.states.forEach((state, index) => {
            if (index === 0) {
                return;
            }
            const step = document.createElement("div");
            step.setAttribute("role", "button");
            step.setAttribute("tabindex", "0");
            step.classList.add("acp-feature-step");

            const stepIcon = document.createElement("span");
            stepIcon.classList.add("acp-feature-step-icon");
            stepIcon.innerHTML = state?.icon || this.icon;

            const stepText = document.createElement("span");
            stepText.setAttribute("data-ap-translate", state.translationKey);
            stepText.classList.add("acp-feature-step-text");

            stepText.innerText = accessProTranslations[state.translationKey] || state.name;

            step.appendChild(stepIcon);

            step.appendChild(stepText);

            step.classList.toggle("active", index === this.currentStateIndex);

            step.addEventListener("click", () => {
                this.steps.querySelectorAll(".acp-feature-step").forEach((step, index) => {
                    step.classList.remove("active");
                }
                );

                if (this.currentStateIndex === index) {
                    // reset to the first state
                    this.onChangeState(this.states[0].value);
                    return;
                }
                this.onChangeState(state.value);

                step.classList.add("active");
            });


            this.steps.appendChild(step);
        });

        this.element.appendChild(this.steps);


        this.element.appendChild(this.stepsDots);

        // this.element.appendChild(this.visuallyHiddenElement);

        container.appendChild(this.element);

        this.updateUI();
    }

    updateUI() {
        const currentState = this.states[this.currentStateIndex];
        const translatedText = this.currentStateIndex === 0 ? accessProTranslations[this.translationKey] || this.name : accessProTranslations[currentState.translationKey] || currentState.name;
        // this.visuallyHiddenElement.innerText = currentState === this.states[0] ? 'Not Activated' : 'Activated';
        if (this.hasOldUI) {
            this.steps.querySelectorAll(".acp-feature-step").forEach((step, index) => {
                step.classList.toggle("active", index + 1 === this.currentStateIndex);
            }

            );
        } else {
            this.featureText.innerHTML = this.currentStateIndex === 0 ? translatedText : `${translatedText}`;
            this.element.classList.toggle("active", currentState !== this.states[0]);
            this.element.setAttribute("data-state", currentState);
            this.stepsDots.querySelectorAll(".acp-steps-dot").forEach((dot, index) => {
                dot.classList.toggle("active", index === this.currentStateIndex);
            });
        }
    }

    sendAnalytics() {
        if (this.featureUsageKey) {
            aswFeaturesUsageUpdate(this.featureUsageKey);
        }
    }
}

class AccessProRangeFeature extends AccessProFeature {
    constructor(name, icon, localStorageKey, translationKey, featureUsageKey, min, max, step) {
        super(name, icon, localStorageKey, translationKey, featureUsageKey);
        this.min = min;
        this.max = max;
        this.step = step;
        this.value = parseFloat(localStorage.getItem(this.localStorageKey)) || (min + max) / 2;

        if (this.value !== (min + max) / 2) {
            this.applyValue(true);
        }
    }

    reset() {
        this.value = (this.min + this.max) / 2;
        this.applyValue(true);
        const rangeInput = document.getElementById("apFontRangeSlider");
        if (rangeInput) {
            rangeInput.value = this.value;
        }
        const rangeValue = document.getElementById("apFontRangeValue");
        if (rangeValue) {
            rangeValue.textContent = `${(this.value - 1).toFixed(1)}`;
        }

    }

    render(container) {
        // Create the wrapper div
        const wrapper = document.createElement("div");
        wrapper.className = "acp-feature-button ap-setting ap-gray-bg ap-setting-full";
        wrapper.style.cssText = `
      padding-block: 20px !important;
      flex-wrap: wrap;
      grid-column: span 2;
    `;

        // Create the title section
        const titleDiv = document.createElement("div");
        titleDiv.className = "ap-setting-full-title";

        const iconSvg = document.createElement("span");
        iconSvg.innerHTML = this.icon;
        titleDiv.appendChild(iconSvg);

        const label = document.createElement("label");
        label.setAttribute("for", "apFontRangeSlider");
        label.className = "ap-font-18 ap-fw-400";
        label.setAttribute("data-ap-translate", this.translationKey);
        label.textContent = this.name;
        titleDiv.appendChild(label);

        wrapper.appendChild(titleDiv);

        // Create the range input wrapper
        const rangeWrapper = document.createElement("div");
        rangeWrapper.className = "ap-range-input-wrapper";

        this.rangeInput = document.createElement("input");
        this.rangeInput.className = "ap-range-input";
        this.rangeInput.id = "apFontRangeSlider";
        this.rangeInput.type = "range";
        this.rangeInput.min = this.min;
        this.rangeInput.max = this.max;
        this.rangeInput.step = this.step;
        this.rangeInput.value = this.value;

        this.rangeInput.addEventListener("input", (event) => this.adjustValue(event.target.value));
        rangeWrapper.appendChild(this.rangeInput);
        wrapper.appendChild(rangeWrapper);

        // Create the value display wrapper
        const valueWrapper = document.createElement("div");
        valueWrapper.className = "ap-range-value-wrapper";

        this.valueDisplay = document.createElement("span");
        this.valueDisplay.className = "ap-range-value";
        this.valueDisplay.id = "apFontRangeValue";
        this.valueDisplay.textContent = `${(this.value - 1).toFixed(1)}`;
        valueWrapper.appendChild(this.valueDisplay);

        wrapper.appendChild(valueWrapper);

        container.appendChild(wrapper);
    }

    onChangeState(state, load = false) {
        this.value = parseFloat(state);
        this.valueDisplay.textContent = `${(this.value - 1).toFixed(1)}`;

        this.rangeInput.value = this.value;

        localStorage.setItem(this.localStorageKey, this.value);
        this.applyValue();
    }

    adjustValue(newValue) {
        this.value = parseFloat(newValue);
        this.valueDisplay.textContent = `${(this.value - 1).toFixed(1)}`;
        localStorage.setItem(this.localStorageKey, this.value);
        this.applyValue();
    }

    applyValue(load = false) {
        // Logic to apply the adjusted font scale to the UI

        try {
            localStorage.setItem(this.localStorageKey, this.value);
            document.querySelectorAll(":not(.asw-menu, .asw-menu *, .asw-widget, .asw-widget *, html, head, head *, meta, meta *, link, link *, script, script *, style, title, form)").forEach(el => {
                const orgFontSize = parseFloat(el.getAttribute("data-asw-orgFontSize")) || parseFloat(window.getComputedStyle(el).getPropertyValue("font-size"));
                const adjustedFontSize = orgFontSize * (parseFloat(this.value) || 1);
                el.style.setProperty("font-size", `${adjustedFontSize}px`, "important");
            });

            if (!load) {
                this.sendAnalytics();
            }
        } catch (error) {
            console.error(error);
        }
    }

    updateUI() {
        super.updateUI();
        if (this.element) {
            this.element.style.display = this.isActive ? "flex" : "none";
        }
    }

    async sendAnalytics() {
        if (this.featureUsageKey) {
            await aswFeaturesUsageUpdate(this.featureUsageKey);
        }
    }
}


/* --------------------------------- */
/*  Profile */
/* --------------------------------- */
class AccessProProfile {
    constructor(name, head, icon, features, translationKey, featuresUsageKey, shortCutKeys) {
        this.name = name;
        // this.activateCallback = activateCallback;
        this.head = head;
        this.isActive = false;
        this.icon = icon;
        this.translationKey = translationKey;
        this.features = features || [];
        this.featuresUsageKey = featuresUsageKey;
        this.shortCutKeys = shortCutKeys || [];
    }

    toggle(
        load = false
    ) {
        this.isActive = !this.isActive;
        // this.activateCallback(this.isActive);
        this.features.forEach(featureObj => {
            if (this.isActive) {
                if (featureObj?.state) {
                    featureObj.feature.onChangeState(featureObj.state);
                } else {
                    featureObj.feature.activate();

                }
            } else {
                if (featureObj?.state) {
                    featureObj.feature.reset()
                } else {
                    featureObj.feature.deactivate();
                }
            }
            featureObj.feature.updateUI();
        });
        this.updateUI();

        if (!load) {
            this.sendAnalytics();
        }
    }

    reset() {
        this.isActive = false;
        this.features.forEach(featureObj => {
            if (featureObj !== null && featureObj !== void 0 && featureObj.state) {
                featureObj.feature.reset();
            } else {
                featureObj.feature.deactivate(true);
            }
            featureObj.feature.updateUI();
        });
        this.updateUI();
    }


    render(container) {
        this.element = document.createElement('div');
        this.element.setAttribute('role', 'button');
        this.element.setAttribute('tabindex', '0');
        this.element.className = 'acp-profile-button';
        this.element.addEventListener('click', () => this.toggle());

        const icon = document.createElement("span");
        icon.innerHTML = this.icon;
        icon.classList.add('acp-profile-icon');
        this.element.appendChild(icon);

        const profileTextContainer = document.createElement("div");
        profileTextContainer.classList.add('acp-profile-text-container');
        profileTextContainer.style.display = 'flex';
        profileTextContainer.style.flexDirection = 'column';
        profileTextContainer.style.gap = '5px';

        const profileText = document.createElement("span");
        profileText.innerText = this.name;
        profileText.classList.add('acp-profile-text');
        profileText.setAttribute('data-ap-translate', this.translationKey);

        profileTextContainer.appendChild(profileText);
        if (accessProTemplate === 'default') {

            const descriptionTranslationKey = this.translationKey?.replace('TITLE', 'HEAD')
            const profileDescription = document.createElement("span");
            profileDescription.classList.add('acp-profile-description');
            profileDescription.innerText = this.head;
            profileDescription.setAttribute('data-ap-translate', descriptionTranslationKey);
            profileDescription.style.fontSize = '12px !important';
            profileDescription.style.textAlign = 'left';
            profileTextContainer.appendChild(profileDescription);

        }



        this.element.appendChild(profileTextContainer);


        // const profileText = document.createElement("span");
        // profileText.innerText = this.name;
        // profileText.classList.add('acp-profile-text');
        // profileText.setAttribute('data-ap-translate', this.translationKey);
        // this.element.appendChild(profileText);

        if (accessProTemplate === 'default') {
            const toggleButton = document.createElement("span");
            toggleButton.style.marginLeft = 'auto';
            toggleButton.classList.add('acp-profile-switch');

            const onToggle = document.createElement("span");
            onToggle.setAttribute('data-ap-translate', 'ON');
            onToggle.classList.add('acp-profile-on');
            onToggle.innerText = 'ON';

            const offToggle = document.createElement("span");
            offToggle.setAttribute('data-ap-translate', 'OFF');
            offToggle.classList.add('acp-profile-off');
            offToggle.innerText = 'OFF';

            toggleButton.appendChild(offToggle);
            toggleButton.appendChild(onToggle);

            this.element.appendChild(toggleButton);

        } else {
            const toggleButton = document.createElement("span");
            toggleButton.style.marginLeft = 'auto';
            toggleButton.classList.add('acp-profile-toggle');
            const innerToggle = document.createElement("span");
            innerToggle.classList.add('acp-profile-inner-toggle');
            toggleButton.appendChild(innerToggle);

            this.element.appendChild(toggleButton);
        }

        container.appendChild(this.element);
        this.updateUI();
    }


    updateUI() {
        this.element.classList.toggle('active', this.isActive);
    }

    sendAnalytics() {
        if (this.featuresUsageKey) {
            aswFeaturesUsageUpdate(this.featuresUsageKey);
        }
    }
}

/* --------------------------------- */
/*  Language */
/* --------------------------------- */
class AccessProLanguage {
    constructor(language, parentWidget) {
        this.name = language.displayTitle || language.name;
        this.code = language.code;
        this.flag = language.flag;
        this.isActive = false; // Track if this language is active
        this.parentWidget = parentWidget; // Reference to AccessPro instance
    }

    render(container) {
        this.element = document.createElement('div');
        this.element.setAttribute('role', 'button');
        this.element.setAttribute('tabindex', '0');
        this.element.className = 'acp-language-button';

        // Create and append the flag icon
        const languageIcon = document.createElement("img");
        languageIcon.src = this.flag;
        languageIcon.style.width = "25px";
        languageIcon.style.height = "25px";
        languageIcon.classList.add('acp-language-icon');
        languageIcon.setAttribute('alt', `${this.name} flag`);
        this.element.appendChild(languageIcon);

        // Create and append the language text
        const languageText = document.createElement("span");
        languageText.innerText = this.name;
        languageText.classList.add('acp-language-text');
        this.element.appendChild(languageText);

        // Add click event listener
        this.element.addEventListener('click', (e) => {
            e.preventDefault();
            this.onChange();

        });

        container.appendChild(this.element);
        this.updateUI();
    }

    onChange(load = false) {
        if (!this.isActive) {
            this.parentWidget.setActiveLanguage(this); // Notify the widget
        }
    }

    updateUI() {
        this.element.classList.toggle('acp-active', this.isActive);
    }

    setActive(isActive) {
        this.isActive = isActive;
        this.updateUI();
    }

    sendAnalytics() {
        aswFeaturesUsageUpdate('language');
    }
}

/* ---------- Features ------- */
/* --------------------------------- */
/*  Font Scale */
/* --------------------------------- */
class AccessProFontScale extends AccessProMultiStepFeature {
    constructor() {
        super(
            'Font Scale',
            ACCESSPRO_ICONS.fontScale,
            [{
                name: 'Normal',
                value: '1',
                translationKey: 'FONT SCALE'
            }, {
                name: 'Medium Font',
                value: '1.2',
                translationKey: 'FONT SCALE'
            }, {
                name: 'Large Font',
                value: '1.5',
                translationKey: 'FONT SCALE'
            }, {
                name: 'Extra Large Font',
                value: '2',
                translationKey: 'FONT SCALE'
            }],
            'accesspro-fontscale',
            'FONT SCALE',
            'font-scale',
            false,
            ["Alt", "F"]
        );
    }

    onChangeState(scale, load = false) {
        super.onChangeState(scale, load);
        try {
            // localStorage.setItem("fontPercentage", scale);
            document.querySelectorAll(":not(.asw-menu, .asw-menu *, .acp-popover, .acp-popover *, #acp-widget, #acp-widget *, .asw-widget, .asw-widget *, html, head, head *, meta, meta *, link, link *, script, script *, style, title, form)").forEach(el => {
                const orgFontSize = parseFloat(el.getAttribute("data-asw-orgFontSize")) || parseFloat(window.getComputedStyle(el).getPropertyValue("font-size"));
                const adjustedFontSize = orgFontSize * (parseFloat(scale) || 1);
                el.style.setProperty("font-size", `${adjustedFontSize}px`, "important");
            });
        } catch (error) {
            console.error(error);
        }
    }

}

/*---------------------------------*/
/*  Line Spacing */
/*---------------------------------*/
class AccessProLineSpacing extends AccessProMultiStepFeature {
    constructor() {
        super(
            'Line Spacing',
            ACCESSPRO_ICONS.lineSpacing,
            [{
                name: 'Normal',
                value: 'normal',
                translationKey: 'LINE SPACING'
            },
            {
                name: 'Wide',
                value: 'wide',
                translationKey: 'LINE SPACING'
            },
            {
                name: 'Extra Wide',
                value: 'extra-wide',
                translationKey: 'LINE SPACING'
            },
            {
                name: 'Narrow',
                value: 'narrow',
                translationKey: 'LINE SPACING'
            }
            ],
            'accesspro-linespacing',
            'LINE SPACING',
            'line-spacing',
            false,
            ["Alt", "L"]
        );

    }


    onChangeState(state, load = false) {
        super.onChangeState(state, load);
        const scale = state === "wide" ? 1.5 : state === "extra-wide" ? 2 : state === "narrow" ? 0.5 : 1;
        document.querySelectorAll(":not(.asw-menu, .asw-menu *, .acp-popover, .acp-popover *, #acp-widget, #acp-widget *, .asw-widget, .asw-widget *, html, head, head *, meta, meta *, link, link *, script, script *, style, title, form)").forEach(el => {
            const orgFontSize = parseFloat(el.getAttribute("data-asw-orgLineHeight")) || parseFloat(window.getComputedStyle(el).getPropertyValue("line-height"));
            const adjustedFontSize = orgFontSize * (parseFloat(scale) || 1);
            el.style.setProperty("line-height", `${adjustedFontSize}px`, "important");
        });

    }
}

/*---------------------------------*/
/*  Letter Spacing */
/*---------------------------------*/
class AccessProLetterSpacing extends AccessProMultiStepFeature {
    constructor() {
        super(
            'Letter Spacing',
            ACCESSPRO_ICONS.letterSpacing,
            [{
                name: 'Normal',
                value: 'normal',
                translationKey: 'LETTER SPACING'
            },
            {
                name: 'Wide',
                value: 'wide',
                translationKey: 'LETTER SPACING'
            },
            {
                name: 'Extra Wide',
                value: 'extra-wide',
                translationKey: 'LETTER SPACING'
            },
            {
                name: 'Narrow',
                value: 'narrow',
                translationKey: 'LETTER SPACING'
            }
            ],
            'accesspro-letterspacing',
            'LETTER SPACING',
            'letter-spacing',
            false,
            ["Alt", "E"]
        );
    }

    onChangeState(state, load = false) {
        super.onChangeState(state, load);
        document.querySelectorAll(":not(.asw-menu, .asw-menu *, .acp-popover, .acp-popover *, #acp-widget, #acp-widget *, .asw-widget, .asw-widget *, html, head, head *, meta, meta *, link, link *, script, script *, style, title, form)").forEach(el => {
            const orgFontSize = parseFloat(el.getAttribute("data-asw-orgLetterSpacing")) || parseFloat(window.getComputedStyle(el).getPropertyValue("letter-spacing"));
            const adjustedFontSize = orgFontSize * (state === "wide" ? 1.5 : state === "extra-wide" ? 2 : state === "narrow" ? 0.5 : 1);
            el.style.setProperty("letter-spacing", `${adjustedFontSize}px`, "important");
        });
    }
}

/*---------------------------------*/
/*  Color Filters */
/*---------------------------------*/
class AccessProColorFilters extends AccessProMultiStepFeature {
    constructor() {
        super(
            'Color Filters',
            ACCESSPRO_ICONS.colorFilters,
            [{
                name: 'Normal',
                value: 'normal',
                translationKey: 'COLOR FILTERS'
            },
            {
                name: 'Grayscale',
                value: 'grayscale',
                translationKey: 'GRAYSCALE'
            },
            {
                name: 'Red/Green',
                value: 'redgreen',
                translationKey: 'RED GREEN'
            },
            {
                name: 'Blue/Yellow',
                value: 'blueyellow',
                translationKey: 'BLUE YELLOW'
            },
            {
                name: 'Green/Red',
                value: 'greenred',
                translationKey: 'GREEN RED'
            }
            ],
            'accesspro-colorfilters',
            'COLOR FILTERS',
            'color-filters',
            false,
            ["Alt", ","]
        );
    }

    onChangeState(state, load = false) {
        super.onChangeState(state, load);
        const filter = state === "grayscale" ? "grayscale(1)" : state === "redgreen" ? "hue-rotate(120deg)" : state === "blueyellow" ? "hue-rotate(180deg)" : state === "greenred" ? "hue-rotate(60deg)" : "none";
        document.querySelector("html").style.setProperty("filter", filter, "important");
    }

    reset() {
        super.reset();
        document.querySelector("html").style.removeProperty("filter");
    }
}

/*---------------------------------*/
/*  Dyslexia */
/*---------------------------------*/
class AccessProDyslexiaFont extends AccessProFeature {
    constructor() {
        super(
            'Dyslexic Font',
            ACCESSPRO_ICONS.dyslexicFont,
            'accesspro-dyslexicfont',
            'DYSLEXIC FONT',
            'dyslexic-font',
            ["Alt", "D"]
        );
    }

    activate(load = false) {
        super.activate(load);
        document.querySelectorAll(":not(.accesspro, .accesspro *, form)").forEach(el => {
            const orgFontFamily = el.style["font-family"];
            el.setAttribute("data-asw-orgFontFamily", orgFontFamily);
            el.style.setProperty("font-family", "OpenDyslexic3", "important");
        });
    }

    deactivate(load = false) {
        super.deactivate(load);
        document.querySelectorAll(":not(.accesspro, .accesspro *, form)").forEach(el => {
            const orgFontFamily = el.getAttribute("data-asw-orgFontFamily");
            if (orgFontFamily) {
                el.style["font-family"] = orgFontFamily;
                el.removeAttribute("data-asw-orgFontFamily");
            } else {
                el.style.removeProperty("font-family");
            }
        });
    }
}

/*---------------------------------*/
/*  Font Weight */
/*---------------------------------*/
class AccessProFontWeight extends AccessProFeature {
    constructor() {
        super(
            'Font Weight',
            ACCESSPRO_ICONS.fontWeight,
            'accesspro-fontweight',
            'FONT WEIGHT',
            'font-weight',
            ["Alt", "W"]
        );

    }

    activate(load = false) {
        super.activate(load);
        document.querySelectorAll(":not(.asw-menu, .asw-menu *, .asw-widget, .asw-widget *, form)").forEach(el => {
            el.classList.add('asw-fontweight-800');
        });
    }

    deactivate(load = false) {
        super.deactivate(load);
        document.querySelectorAll(":not(.asw-menu, .asw-menu *, .asw-widget, .asw-widget *, form)").forEach(el => {
            el.classList.remove('asw-fontweight-800');
        });
    }
}

/*---------------------------------*/
/* Text Alignment */
/*---------------------------------*/
class AccessProTextAlignment extends AccessProMultiStepFeature {
    constructor() {
        super(
            'Text Alignment',
            ACCESSPRO_ICONS.textAlignment,
            [{
                name: 'Normal',
                value: 'normal',
                translationKey: 'NORMAL'
            },
            {
                name: 'Left',
                value: 'left',
                translationKey: 'LEFT',
                icon: ACCESSPRO_ICONS.textAlignmentLeft
            },
            {
                name: 'Center',
                value: 'center',
                translationKey: 'CENTER',
                icon: ACCESSPRO_ICONS.textAlignmentCenter
            },
            {
                name: 'Right',
                value: 'right',
                translationKey: 'RIGHT',
                icon: ACCESSPRO_ICONS.textAlignmentRight
            },
            ],
            'accesspro-textalignment',
            'TEXT ALIGN',
            'text-alignment',
            true,
            ["Alt", "T"]
        );
    }

    onChangeState(state, load = false) {
        super.onChangeState(state, load);
        document.body.classList.remove('asw-textalignment-left', 'asw-textalignment-center', 'asw-textalignment-right', 'asw-textalignment-justify');

        document.body.classList.add(`asw-textalignment-${state}`);
    }

}

/* --------------------------------- */
/*  Contrast Mode (Dark, Light, High Contrast) */
/* --------------------------------- */
class AccessProContrastMode extends AccessProMultiStepFeature {
    constructor() {
        super(
            'Contrast Mode',
            ACCESSPRO_ICONS.contrastMode,
            [{
                name: 'Normal',
                value: 'normal'
            },
            {
                name: 'Dark Contrast',
                value: 'dark',
                translationKey: 'DARK',
                icon: ACCESSPRO_ICONS.darkContrast
            },
            {
                name: 'Light Contrast',
                value: 'light',
                translationKey: 'LIGHT',
                icon: ACCESSPRO_ICONS.lightContrast
            },
            {
                name: 'High Contrast',
                value: 'high',
                translationKey: 'HIGH',
                icon: ACCESSPRO_ICONS.highContrast
            }
            ],
            'accesspro-contrastmode',
            'CONTRAST',
            'contrast',
            true,
            ["Alt", "C"]
        );


    }

    onChangeState(state, load = false) {
        super.onChangeState(state, load);
        try {
            // Reset all previously applied styles and remove active classes
            document.querySelectorAll(".asw-menu, .asw-menu-btn").forEach(el => el.style.removeProperty("filter"));
            document.querySelector("html").style.removeProperty("filter");
            document.body.querySelectorAll(":not(.asw-menu):not(.asw-menu *):not(.asw-widget):not(.asw-widget *)").forEach(el => {
                this.aswRevertBackgroundAndColor(el);
            });



            // Handle each state specifically
            switch (state) {
                case 'dark':
                    document.querySelectorAll(":not(head, head *, button, button *, .asw-menu, .asw-menu *, .asw-widget , .asw-widget *, #readingMaskWindow, script)").forEach(el => {
                        this.aswRevertBackgroundAndColor(el);
                        el.style.color = "#ddddddff";
                        el.tagName === "BODY" ? el.style.backgroundColor = "#222222ff" : el.style.backgroundColor = "transparent";
                        const orgBgNotImg = el.getAttribute("data-asw-orgBgNotImg");
                        if (orgBgNotImg) {
                            el.style.backgroundImage = "none";
                        }
                    });
                    break;

                case 'light':
                    document.querySelectorAll(":not(head, head *, button, button *, .asw-menu, .asw-menu *, .asw-widget , .asw-widget *, #readingMaskWindow, script)").forEach(el => {
                        this.aswRevertBackgroundAndColor(el);
                        el.style.color = "#222";
                        el.tagName === "BODY" ? el.style.backgroundColor = "#fff" : el.style.backgroundColor = "transparent";
                        const orgBgNotImg = el.getAttribute("data-asw-orgBgNotImg");
                        if (orgBgNotImg) {
                            el.style.backgroundImage = "none";
                        }
                    });
                    break;

                case 'high':
                    document.querySelector("html").style.filter = "contrast(1.5)";
                    document.querySelectorAll(".asw-menu, .asw-menu-btn").forEach(el => el.style.setProperty("filter", "contrast(0.66666)"));
                    break;
                case 'none':
                default:
                    break;
            }
        } catch (error) {
            console.error(error);
        }
    }

    aswRevertBackgroundAndColor(el, selfCall = false) {
        try {
            //   if (selfCall) aswFeaturesUsageUpdate("constrast-background");
            const orgColor = el.getAttribute("data-asw-orgColor");
            const orgBgColor = el.getAttribute("data-asw-orgBgColor");
            const orgFilter = el.getAttribute("data-asw-orgFilter");
            const orgBgNotImg = el.getAttribute("data-asw-orgBgNotImg");
            if (orgBgNotImg) {
                el.style.backgroundImage = orgBgNotImg;
            } else if (!window.getComputedStyle(el).getPropertyValue("background-image").includes("url(")) {
                el.style.removeProperty("background-image");
            }
            if (orgColor) {
                el.style.color = orgColor;
            } else {
                el.style.removeProperty("color");
            }
            if (orgBgColor) {
                el.style.backgroundColor = orgBgColor;
            } else {
                el.style.removeProperty("background-color");
            }
            if (orgFilter) {
                el.style.filter = orgFilter;
            } else {
                el.style.removeProperty("filter");
            }
        } catch (error) {
            console.error(error);
        }
    }

}

/* --------------------------------- */
/*  Color Saturation ( High, low, black and white) */
/* --------------------------------- */
class AccessProColorSaturation extends AccessProMultiStepFeature {
    constructor() {
        super(
            'Color Saturation',
            ACCESSPRO_ICONS.colorSaturation,
            [{
                name: 'Normal',
                value: 'normal'
            },
            {
                name: 'High',
                value: 'high',
                translationKey: 'HIGH',
                icon: ACCESSPRO_ICONS.highSaturation
            },
            {
                name: 'Low',
                value: 'low',
                translationKey: 'LOW',
                icon: ACCESSPRO_ICONS.lowSaturation
            },
            {
                name: 'Black & White',
                value: 'bw',
                translationKey: 'BLACK & WHITE',
                icon: ACCESSPRO_ICONS.blackAndWhite
            }
            ],
            'accesspro-colorsaturation',
            'SATURATION',
            'color-saturation',
            true,
            ["Alt", "S"]
        );
    }

    onChangeState(state, load = false) {
        super.onChangeState(state, load);
        switch (state) {
            case 'normal':
                this.resetFilters();
                break;
            case 'high':
                this.adjustHighSaturation();
                break;
            case 'low':
                this.adjustLowSaturation();
                break;
            case 'bw':
                this.enableMonochrome();
                break;
            default:
                console.warn(`Unknown state: ${state}`);
        }
    }

    resetFilters() {
        try {
            document.querySelector('html').style.filter = '';
        } catch (error) {
            console.error('Error resetting filters:', error);
        }
    }

    enableMonochrome() {
        try {
            this.resetFilters();
            document.querySelector('html').style.filter = 'grayscale(1)';
        } catch (error) {
            console.error('Error enabling monochrome mode:', error);
        }
    }

    adjustHighSaturation() {
        try {

            this.resetFilters();
            const html = document.querySelector('html');
            html.style.filter = 'saturate(1.5)';

        } catch (error) {
            console.error('Error adjusting high saturation:', error);
        }
    }

    adjustLowSaturation() {
        try {
            this.resetFilters();
            const html = document.querySelector('html');
            html.style.filter = 'saturate(0.5)';

        } catch (error) {
            console.error('Error adjusting low saturation:', error);
        }
    }
}

/* -------------------------------- */
/*  Invert Colors */
/* -------------------------------- */
class AccessProInvertColors extends AccessProFeature {
    constructor() {
        super(
            'Invert Colors',
            ACCESSPRO_ICONS.invertColors,
            'accesspro-invertcolors',
            'INVERT COLORS',
            'invert-colors',
            ["Alt", "I"]
        );



    }

    activate(load = false) {
        super.activate(load);
        // Add the filter to the html element
        document.querySelector('html').style.filter = 'invert(1)';
    }

    deactivate(load = false) {
        super.deactivate(load);
        // Remove the filter from the html element
        document.querySelector('html').style.removeProperty('filter');
    }
}


/* --------------------------------- */
/*  Big Cursor */
/* --------------------------------- */
class AccessProBigCursor extends AccessProFeature {
    constructor() {
        super(
            'Big Cursor',
            ACCESSPRO_ICONS.cursor,
            'accesspro-bigcursor',
            'CURSOR',
            'cursor',
            ["Alt", "U"]
        );


    }


    activate(load = false) {
        super.activate(load);
        document.querySelectorAll(":not(.asw-menu, .asw-menu *, .asw-widget, .asw-widget *, form)").forEach(el => {
            if (el.tagName.toLowerCase() == "a") {
                let svgCursor = ACCESSPRO_ICONS.bigPointerCursor;
                let cursor = `url("${svgCursor}"), default`;
                el.style.setProperty("cursor", cursor, "important");
            } else {
                let cursor = ACCESSPRO_ICONS.bigDefaultCursor;
                el.style.setProperty("cursor", cursor, "important");
            }
        });
    }

    deactivate(load = false) {
        super.deactivate(load);
        document.querySelectorAll(":not(.asw-menu, .asw-menu *, .asw-widget, .asw-widget *)").forEach(el => {
            el.style.removeProperty("cursor");
        });
    }

}

/* --------------------------------- */
/*  Text Magnifier */
/* --------------------------------- */
class AccessProTextMagnifier extends AccessProFeature {
    constructor() {
        super(
            'Text Magnifier',
            ACCESSPRO_ICONS.textMagnifier,
            'accesspro-textmagnifier',
            'TEXT MAGNIFIER',
            'text-magnifier',
            ["Alt", "M"]
        );


    }

    activate(load = false) {
        super.activate(load);
        document.body.querySelectorAll(":not(#draggableHeader, #draggableHeader *, .asw-widget, .asw-widget *)").forEach(el => {
            if (!el.classList.contains("material-icons") && !el.classList.contains("material-symbols-outlined") && el.tagName.toLowerCase() !== "script" && el.tagName.toLowerCase() !== "style" && el.innerText !== "") {
                el.setAttribute("data-asw-text", el.innerText);
                document.addEventListener("mouseover", this.aswShowTooltip);
                document.addEventListener("mouseout", this.aswHideTooltip);
            }
        });
    }

    deactivate(load = false) {
        super.deactivate(load);
        document.body.querySelectorAll(":not(#draggableHeader, #draggableHeader *, .asw-menu, .asw-menu *)").forEach(el => {
            if (!el.classList.contains("material-icons") && !el.classList.contains("material-symbols-outlined") && el.tagName.toLowerCase() !== "script" && el.tagName.toLowerCase() !== "style") {
                el.removeAttribute("data-asw-text");
                document.removeEventListener("mouseover", this.aswShowTooltip);
                document.removeEventListener("mouseout", this.aswHideTooltip);
                this.aswHideTooltip();
            }
        })
        document.querySelector("#aoda-tooltip") && document.querySelector("#aoda-tooltip").remove();

    }

    aswShowTooltip(event) {
        const {
            target
        } = event;
        const tooltipContent = target.getAttribute("data-asw-text");
        if (tooltipContent) {
            this.aswMagnifyWrapper = document.createElement("div");
            this.aswMagnifyWrapper.id = "aoda-tooltip";
            this.aswMagnifyWrapper.style.minWidth = "200px";
            this.aswMagnifyWrapper.style.maxWidth = "800px";
            this.aswMagnifyWrapper.style.borderRadius = "4px";
            this.aswMagnifyWrapper.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
            this.aswMagnifyWrapper.style.color = "#fff";
            this.aswMagnifyWrapper.style.padding = "10px";
            this.aswMagnifyWrapper.style.fontSize = "30px";
            this.aswMagnifyWrapper.style.position = "absolute";
            this.aswMagnifyWrapper.style.pointerEvents = "none";
            this.aswMagnifyWrapper.style.wordBreak = "break-all";
            this.aswMagnifyWrapper.style.zIndex = Number.MAX_SAFE_INTEGER;
            this.aswMagnifyWrapper.textContent = tooltipContent;
            document.body.appendChild(this.aswMagnifyWrapper);
            let x = event.pageX;
            const y = event.pageY;
            const tooltipWidth = this.aswMagnifyWrapper.offsetWidth;
            const screenWidth = window.innerWidth;

            // Adjust position to ensure tooltip does not overflow screen width
            this.aswMagnifyWrapper.style.left = `${x}px`;
            this.aswMagnifyWrapper.style.top = `${y}px`;
            if (x + tooltipWidth > screenWidth) {
                this.aswMagnifyWrapper.style.right = `0px`;
            }
        }
    }

    aswHideTooltip() {
        this.aswMagnifyWrapper && this.aswMagnifyWrapper.remove();
        this.aswMagnifyWrapper = null;
    }
}

/* --------------------------------- */
/*  Reading Guide */
/* --------------------------------- */
class AccessProReadingGuide extends AccessProFeature {
    constructor() {
        super(
            'Reading Guide',
            ACCESSPRO_ICONS.readingGuide,
            'accesspro-readingguide',
            'READING GUIDE',
            'reading-guide',
            ["Alt", "G"]
        );

        // Initialize properties
        this.guideElement = null;

        // Bind methods to ensure correct context
        this.boundUpdateGuidePosition = this.updateGuidePosition.bind(this);

        // Activate guide immediately if saved state is active


    }

    activate(load = false) {
        super.activate(load);

        if (!this.guideElement) {
            this.createGuide();
        }
        document.addEventListener("mousemove", this.boundUpdateGuidePosition);
    }

    deactivate(load = false) {
        super.deactivate(load);

        if (this.guideElement) {
            this.removeGuide();
        }
        document.removeEventListener("mousemove", this.boundUpdateGuidePosition);
    }

    createGuide() {
        if (this.guideElement) return; // Prevent duplicate guides

        this.guideElement = document.createElement("div");
        this.guideElement.id = "aoda-reading-guide";
        Object.assign(this.guideElement.style, {
            width: "100vw",
            height: "10px",
            border: "2px solid #a7d345",
            backgroundColor: "#444",
            opacity: "0.8",
            position: "absolute",
            top: "-100%",
            display: "block",
            pointerEvents: "none",
            zIndex: Number.MAX_SAFE_INTEGER,
        });

        document.body.insertBefore(this.guideElement, document.body.firstChild);
    }

    removeGuide() {
        if (this.guideElement) {
            this.guideElement.remove();
            this.guideElement = null;
        }
    }

    updateGuidePosition(event) {
        if (this.guideElement) {
            const y = event.pageY - 10; // Adjust the guide's position
            this.guideElement.style.top = `${y}px`;
        }
    }
}

/* --------------------------------- */
/*  Reading Mask */
/* --------------------------------- */
class AccessProReadingMask extends AccessProFeature {
    constructor() {
        super(
            'Reading Mask',
            ACCESSPRO_ICONS.readingMask,
            'accesspro-readingmask',
            'READING MASK',
            'reading-mask',
            ["Alt", "R"]

        );

        // Initialize properties
        this.maskElement = null;
        this.maskWindow = null;
        this.isMaskCreated = false; // Track whether the mask is already created

        // Bind methods to ensure proper context
        this.boundMoveMask = this.moveMask.bind(this);




    }

    activate(load = false) {
        // Prevent duplicate activation
        if (this.isMaskCreated) {
            return;
        }

        super.activate(load);

        this.createMask();
        document.addEventListener("mousemove", this.boundMoveMask);

    }

    deactivate(load = false) {
        if (!this.isMaskCreated) {
            return;
        }

        super.deactivate(load);

        this.removeMask();
        document.removeEventListener("mousemove", this.boundMoveMask);

    }

    createMask() {
        if (this.isMaskCreated) {
            return; // Avoid creating the mask if it already exists
        }

        // Create main mask container
        this.maskElement = document.createElement("div");
        Object.assign(this.maskElement.style, {
            position: "fixed",
            top: "0",
            left: "0",
            right: "0",
            background: "transparent",
            zIndex: Number.MAX_SAFE_INTEGER,
        });

        // Create mask window
        this.maskWindow = document.createElement("div");
        this.maskWindow.id = "readingMaskWindow";
        Object.assign(this.maskWindow.style, {
            position: "fixed",
            left: "0",
            right: "0",
            height: "150px",
            boxShadow: "0 0 0 10000px rgba(0, 0, 0, 0.7)",
            display: "block",
            pointerEvents: "none",
        });

        // Append mask window to mask container
        this.maskElement.appendChild(this.maskWindow);

        // Insert the mask into the DOM
        document.body.insertBefore(this.maskElement, document.body.firstChild);

        this.isMaskCreated = true; // Mark the mask as created
    }

    removeMask() {
        if (this.maskElement) {
            this.maskElement.remove();
            this.maskElement = null;
            this.maskWindow = null;
            this.isMaskCreated = false; // Mark the mask as removed
        }
    }

    moveMask(event) {
        if (this.maskWindow) {
            const y = event.clientY - 75; // Center the mask around the cursor
            this.maskWindow.style.transform = `translateY(${y}px)`;
        }
    }
}

/* --------------------------------- */
/*  Highlight Links */
/* --------------------------------- */
class AccessProHighlightLinks extends AccessProFeature {
    constructor() {
        super(
            'Highlight Links',
            ACCESSPRO_ICONS.highlightLinks,
            'accesspro-highlightlinks',
            'HIGHLIGHT LINKS',
            'highlight-links',
            ["Alt", "K"]
        );


    }

    activate(load = false) {
        super.activate(load);
        document.querySelectorAll("a:not(.asw-menu *):not(.asw-widget *),button:not(.asw-menu *):not(.asw-widget *)").forEach(anchor => {
            const orgTextDecoration = window.getComputedStyle(anchor).getPropertyValue("text-decoration");
            const orgFontWeight = window.getComputedStyle(anchor).getPropertyValue("font-weight");
            const orgFontSize = window.getComputedStyle(anchor).getPropertyValue("font-size");
            const orgLinkColor = window.getComputedStyle(anchor).getPropertyValue("color");
            anchor.setAttribute("data-asw-orgLinkTextDecoration", orgTextDecoration);
            anchor.setAttribute("data-asw-orgLinkFontWeight", orgFontWeight);
            anchor.setAttribute("data-asw-orgLinkFontSize", orgFontSize);
            anchor.setAttribute("data-asw-orgLinkColor", orgLinkColor);
            anchor.style.textDecoration = "underline";
            anchor.style.fontWeight = "800";
            anchor.style["font-size"] = `${parseInt(orgFontSize) * 1.1}px`;
            anchor.style.color = "#ff0000";
        });
    }

    deactivate(load = false) {
        super.deactivate(load);
        document.querySelectorAll("a:not(.asw-menu *):not(.asw-widget *),button:not(.asw-menu *):not(.asw-widget *)").forEach(anchor => {
            const orgTextDecoration = anchor.getAttribute("data-asw-orgLinkTextDecoration");
            const orgFontWeight = anchor.getAttribute("data-asw-orgLinkFontWeight");
            const orgFontSize = anchor.getAttribute("data-asw-orgLinkFontSize");
            const orgLinkColor = anchor.getAttribute("data-asw-orgLinkColor");
            anchor.style.color = orgLinkColor;
            anchor.style.fontSize = orgFontSize;
            anchor.style.textDecoration = orgTextDecoration;
            anchor.style.fontWeight = orgFontWeight;
        });
    }
}

/* --------------------------------- */
/*  Highlight Headings */
/* --------------------------------- */
class AccessProHighlightHeadings extends AccessProFeature {
    constructor() {
        super(
            'Highlight Headings',
            ACCESSPRO_ICONS.highlightHeadings,
            'accesspro-highlightheadings',
            'HIGHLIGHT HEADINGS',
            'highlight-heading',
            ["Alt", "H"]
        );


    }

    activate(load = false) {
        super.activate(load);
        document.querySelectorAll("h1:not(.asw-menu *):not(.asw-widget *), h2:not(.asw-menu *):not(.asw-widget *), h3:not(.asw-menu *):not(.asw-widget *),heading1:not(.asw-menu *):not(.asw-widget *)").forEach(heading => {
            const orgTextDecoration = window.getComputedStyle(heading).getPropertyValue("text-decoration");
            const orgHighlightColor = window.getComputedStyle(heading).getPropertyValue("color");
            heading.setAttribute("data-asw-orgHighlightTextDecoration", orgTextDecoration);
            heading.setAttribute("data-asw-orgHighlightColor", orgHighlightColor);
            heading.style.color = "#ff0000";
            heading.style.textDecoration = "underline";
        });

    }

    deactivate(load = false) {
        super.deactivate(load);
        document.querySelectorAll("h1:not(.asw-menu *):not(.asw-widget *), h2:not(.asw-menu *):not(.asw-widget *), h3:not(.asw-menu *):not(.asw-widget *),heading1:not(.asw-menu *):not(.asw-widget *)").forEach(heading => {
            const orgTextDecoration = heading.getAttribute("data-asw-orgHighlightTextDecoration");
            const orgHighlightColor = heading.getAttribute("data-asw-orgHighlightColor");
            heading.style.textDecoration = orgTextDecoration;
            heading.style.color = orgHighlightColor;
        });
    }
}

/* --------------------------------- */
/*  Mute Sound */
/* --------------------------------- */
class AccessProMuteSound extends AccessProFeature {
    constructor() {
        super(
            'Mute Sound',
            ACCESSPRO_ICONS.muteSound,
            'accesspro-mutesound',
            'MUTE SOUNDS',
            'mute-sound',
            ["Alt", "O"]
        );


    }

    activate(load = false) {
        super.activate(load);
        document.querySelectorAll("audio").forEach(audio => {
            audio.muted = true;
        });
    }

    deactivate(load = false) {
        super.deactivate(load);
        document.querySelectorAll("audio").forEach(audio => {
            audio.muted = false;
        });
    }
}

/* --------------------------------- */
/*  Stop Animation */
/* --------------------------------- */
class AccessProStopAnimation extends AccessProFeature {
    constructor() {
        super(
            'Stop Animation',
            ACCESSPRO_ICONS.stopAnimation,
            'accesspro-stopanimation',
            'STOP ANIMATION',
            'stop-animation',
            ["Alt", "A"]
        );

    }

    activate(load = false) {
        super.activate(load);
        document.body.classList.add("asw-stop-animation");
        this.pauseGifBackgrounds();
    }

    deactivate(load = false) {
        super.deactivate(load);
        document.body.classList.remove("asw-stop-animation");
        document.querySelectorAll('.asw-remove-gif').forEach(element => {
            element.classList.remove("asw-remove-gif");
        });
    }

    pauseGifBackgrounds() {
        document.querySelectorAll('*').forEach(element => {
            const style = window.getComputedStyle(element);
            // Use a regex to handle different URL formats and parameters
            if (/\.gif(\?|#|$)/i.test(style.backgroundImage)) {
                element.classList.add("asw-remove-gif");
            }
        });
    }
}

/* --------------------------------- */
/*  Hide Images */
/* --------------------------------- */
class AccessProHideImages extends AccessProFeature {
    constructor() {
        super(
            'Hide Images',
            ACCESSPRO_ICONS.hideImages,
            'accesspro-hideimages',
            'HIDE IMAGES',
            'hide-images',
            ["Alt", "N"]
        );
    }

    activate(load = false) {
        super.activate(load);
        document.querySelectorAll(":not(.asw-menu):not(.asw-menu *):not(.asw-widget):not(asw-widget *)").forEach(el => {
            if (el.tagName === "IMG") {
                el.style.visibility = "hidden";
            }
            const computedStyle = window.getComputedStyle(el);
            const bg = computedStyle.getPropertyValue("background");
            const bgImg = computedStyle.getPropertyValue("background-image");
            if (bg.includes("url(")) {
                el.setAttribute("data-asw-bg", bg);
                el.style.background = "none";
            }
            if (bgImg.includes("url(")) {
                el.setAttribute("data-asw-bgImg", bgImg);
                el.style.backgroundImage = "none";
            }
        });
    }

    deactivate(load = false) {
        super.deactivate(load);
        document.querySelectorAll(":not(.asw-menu):not(.asw-menu *):not(.asw-widget):not(asw-widget *)").forEach(el => {
            if (el.tagName === "IMG") {
                el.style.visibility = "visible";
            }
            const bg = el.getAttribute("data-asw-bg");
            const bgImg = el.getAttribute("data-asw-bgImg");
            if (bg) {
                el.style.background = bg;
                el.removeAttribute("data-bg");
            }
            if (bgImg) {
                el.style.backgroundImage = bgImg;
                el.removeAttribute("data-bgImg");
            }
        });
    }
}

/*---------------------------------*/
/* Base class for text to speech and text summary */
/*---------------------------------*/
class AccessProTextFeature extends AccessProFeature {
    constructor(name, icon, identifier, translationKey, shortCutKeys) {
        super(name, icon, identifier, translationKey, 'text', shortCutKeys);
        this.speech = new AccessProSpeech();
        this.handleElementInteractionBound = this.handleElementInteraction.bind(this);
        this.handleKeyPressBound = this.handleKeyPress.bind(this);
        this.barElement = null;
        this.closeButton = null;
        this.identifier = identifier;
    }

    createFeatureBar() {
        // Create main bar container
        this.barElement = document.createElement('div');
        this.barElement.classList.add('asw-text-speech-bar');
        this.barElement.setAttribute('role', 'status');


        // Left content
        const leftContent = document.createElement('div');
        leftContent.classList.add('asw-text-bar-left-content');
        leftContent.style.display = 'flex';


        // Icon
        const iconImg = document.createElement('span');
        iconImg.innerHTML = this.icon;
        iconImg.classList.add('asw-text-bar-icon');


        // Text
        const text = document.createElement('span');
        text.textContent = this.name + ' Enabled';
        text.setAttribute('aria-live', 'polite');

        leftContent.append(iconImg, text);

        // Close button
        this.closeButton = document.createElement('div');
        this.closeButton.setAttribute('role', 'button');
        this.closeButton.setAttribute('tabindex', '0');
        this.closeButton.classList.add('asw-text-bar-close');
        this.closeButton.setAttribute('aria-label', 'Disable screen reader');

        // Close icon (X)
        this.closeButton.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke-width="2" style="stroke: var(--acp-color-headerbg);">
        <path d="M18 6L6 18M6 6l12 12"/>
      </svg>
    `;

        // Add click handler
        this.closeButton.addEventListener('click', () => {
            this.deactivate();
        });

        // Help button
        this.helpButton = document.createElement('div');
        this.helpButton.setAttribute('role', 'button');
        this.helpButton.setAttribute('tabindex', '0');
        this.helpButton.classList.add('voice-bar-help-button');
        this.helpButton.setAttribute('aria-label', 'Show help for text feature');
        this.helpButton.textContent = 'Help';
        this.helpButton.addEventListener('click', () => {
            this.showHelpModal();
        });

        // Insert help button before close button
        this.barElement.append(leftContent, this.helpButton, this.closeButton);
        document.body.appendChild(this.barElement);
    }

    activate(load = false) {
        super.activate(load);
        if (!this.barElement) {
            this.createFeatureBar();
        }

        try {
            // Disable any other active text features
            if (this.identifier === 'accesspro-texttospeech' && accessProTextSummary?.isActive) {
                accessProTextSummary.deactivate();
            }

            if (this.identifier === 'accesspro-textsummary' && accessProTextToSpeech?.isActive) {
                accessProTextToSpeech.deactivate();
            }
        } catch (error) {
            console.error('Error while deactivating conflicting features:', error);
        }

        document.addEventListener('click', this.handleElementInteractionBound);
        document.addEventListener('focus', this.handleElementInteractionBound, true);
        document.addEventListener('keydown', this.handleKeyPressBound);

        // Speak instructions after short delay
        setTimeout(() => {
            let instructions = `${this.name} enabled.`
            if (this.identifier === 'accesspro-texttospeech') {
                instructions += `Use Tab key to move forward & Shift + Tab to move backward. ` +
                    'Press Control to pause speech.';
            } else if (this.identifier === 'accesspro-textsummary') {
                instructions += `Click on any text to have it summarized.`;
            }
            this.speech.speak(instructions);
        }, 300);
    }

    deactivate(load = false) {
        super.deactivate(load);
        if (this.barElement) {
            this.barElement.remove();
            this.barElement = null;
        }
        document.removeEventListener('click', this.handleElementInteractionBound);
        document.removeEventListener('focus', this.handleElementInteractionBound, true);
        document.removeEventListener('keydown', this.handleKeyPressBound);
        this.speech.speak("Screen reader disabled");
        this.speech.stop();
        document.querySelectorAll(".aoda-speech-highlight").forEach(el => {
            el.classList.remove("aoda-speech-highlight");
        });
    }

    handleKeyPress(event) {
        // Pause/resume with Control key
        if (event.key === 'Control' && !event.altKey && !event.metaKey) {
            event.preventDefault();
            this.speech.togglePause();
        }
    }

    deactivate(load = false) {
        super.deactivate(load);
        if (this.barElement) {
            this.barElement.remove();
            this.barElement = null;
        }
        document.removeEventListener('click', this.handleElementInteractionBound);
        document.removeEventListener('focus', this.handleElementInteractionBound, true);
        this.speech.stop();
        document.querySelectorAll(".aoda-speech-highlight").forEach(el => {
            el.classList.remove("aoda-speech-highlight");
        });
    }


    handleElementInteraction(event) {
        const targetElement = event.target;
        // if (targetElement.textContent.trim() !== "" || targetElement.tagName.toLowerCase() === "img") {
        this.handleTextElement(targetElement);
        // }
    }

    // Abstract method to be implemented by subclasses
    handleTextElement(targetElement) {
        throw new Error("handleTextElement method must be implemented in subclass");
    }

    showHelpModal() {
        if (!this._helpModal) {
            this._helpModal = new AccessProHelpModal({
                id: 'text-feature-help-overlay',
                title: 'Text Feature Guide',
                contentHTML: `
          <div class="command-category">
            <h3>Getting Started</h3>
            <ul>
              <li>Click on any text or image to have it read aloud or summarized.</li>
              <li>Use <kbd>Tab</kbd> to move forward and <kbd>Shift + Tab</kbd> to move backward between elements.</li>
              <li>Press <kbd>Control</kbd> to pause speech.</li>
            </ul>
          </div>
        `
            });
        }
        this._helpModal.show();
    }
}

/* --------------------------------- */
/*  Text to Speech */
/* --------------------------------- */
class AccessProTextToSpeech extends AccessProTextFeature {
    constructor() {
        super('Screen Reader', ACCESSPRO_ICONS.textToSpeech, 'accesspro-texttospeech', 'SCREEN READER', ["Alt", "P"]);
    }

    handleTextElement(targetElement) {
        this.speech.speakWithElement(targetElement); // Speak the content
    }
}

/* --------------------------------- */
/*  Text Summary */
/* --------------------------------- */
class AccessProTextSummary extends AccessProTextFeature {
    constructor() {
        super('Text Summary', ACCESSPRO_ICONS.textSummary, 'accesspro-textsummary', 'TEXT TO SUMMARY', ["Alt", "Q"]);
    }

    async handleTextElement(targetElement) {
        let textToSpeak = targetElement.tagName.toLowerCase() === "img" ? targetElement.alt : targetElement.innerText;

        // If the text is long enough, summarize and speak the result
        if (textToSpeak.length > 50) {
            try {
                const response = await fetch("https://accessibility.nerdplatoon.net/api/v1/text/summarize/", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        text: textToSpeak
                    })
                });
                const responseData = await response.json();
                if (responseData && responseData.data) {
                    const summarizedText = responseData.data.summary;
                    this.speakSummary(summarizedText); // Speak the summarized text
                } else {
                    this.speakSummary(textToSpeak); // If no summary, speak the original text
                }
            } catch (error) {
                console.error("Error fetching summary:", error);
                this.speakSummary(textToSpeak); // Fallback to original text
            }
        } else {
            this.speakSummary(textToSpeak); // If text is short, speak it directly
        }
    }

    speakSummary(text) {
        if (this.speech) {
            this.speech.speak(text); // Use the method from AccessProSpeech to speak
        }
    }
}

/* --------------------------------- */
/*  Virtual Keyboard */
/* --------------------------------- */
class AccessProVirtualKeyboard extends AccessProFeature {
    constructor() {
        super('Virtual Keyboard', ACCESSPRO_ICONS.virtualKeyboard, 'accesspro-virtualkeyboard', 'VIRTUAL KEYBOARD', ["Alt", "Z"]);
        this.keyboardInstance = null;
        this.popup = document.getElementById('acp-virtualKeyboardPopup');
        this.closeBtn = document.getElementById('acp-closeKeyboardBtn');
        this.currentInputField = null;
        this.layoutName = "default";
        this.shortCutKeys = ["Alt", "Z"];

        // if (this.isActive) this.activate(true);

        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => this.deactivate());
        }


        document.addEventListener('focusin', (event) => {
            if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
                this.currentInputField = event.target;
                if (this.keyboardInstance) {
                    this.keyboardInstance.setInput(this.currentInputField.value || '');
                }
            }
        });

        document.addEventListener('input', (event) => {
            if (event.target === this.currentInputField && this.keyboardInstance) {
                this.keyboardInstance.setInput(this.currentInputField.value);
            }
        });
    }

    async activate(load = false) {
        super.activate(load);

        const loaderStyles = `
    border-top: 3px solid #ffffff;
    border-right: 3px solid var(--acp-color-contentfg);
    border-bottom: 3px solid #ffffff;
    border-left: 3px solid var(--acp-color-contentfg);
    border-radius: 50%;
    width: 30px;
    height: 30px;
    position: relative;
    display: inline-block;
    animation: spin 1s linear infinite;
  `;


        const existingLoader = this.element.querySelector('.acp-loader-button');
        if (existingLoader) {
            console.warn('Loader already active.');
            return;
        }

        const loader = document.createElement('div');
        loader.classList.add('acp-loader-button');
        loader.style.cssText = loaderStyles;

        this.element.classList.add('acp-feature-loading');
        const iconContainer = this.element.querySelector('.acp-feature-icon');
        if (iconContainer) iconContainer.appendChild(loader);

        // Define the CSS animation for the loader
        const styleSheet = document.createElement("style");
        styleSheet.type = "text/css";
        styleSheet.innerText = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
        document.head.appendChild(styleSheet);

        const loadCss = (href) =>
            new Promise((resolve, reject) => {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = href;
                link.onload = resolve;
                link.onerror = reject;
                document.head.appendChild(link);
            });

        const loadScript = (src) =>
            new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = src;
                script.defer = true;
                script.onload = resolve;
                script.onerror = reject;
                document.head.appendChild(script);
            });

        const minimumTime = new Promise((resolve) => setTimeout(resolve, 300));

        await Promise.all([
            loadCss('https://cdn.jsdelivr.net/npm/simple-keyboard@latest/build/css/index.css'),
            loadScript('https://cdn.jsdelivr.net/npm/simple-keyboard@latest/build/index.js'),
            minimumTime,
        ]);

        const Keyboard = window.SimpleKeyboard.default;

        if (!this.keyboardInstance && Keyboard) {
            this.keyboardInstance = new Keyboard({
                layoutName: this.layoutName,
                onChange: (input) => {
                    if (this.currentInputField) {
                        this.currentInputField.value = input;
                        const inputEvent = new Event('input', { bubbles: true });
                        this.currentInputField.dispatchEvent(inputEvent);
                    }
                },
                onKeyPress: (button) => this.handleVirtualKey(button),
            });
        }

        if (this.popup) {
            this.popup.style.display = 'block';
        }

        // Remove loader after initialization
        loader.remove();
        this.element.classList.remove('acp-feature-loading');
    }


    deactivate(load = false) {
        super.deactivate(load);
        if (this.popup) {
            this.popup.style.display = 'none';
        }
        this.currentInputField = null;
    }

    handleVirtualKey(button) {
        if (!this.currentInputField) return;
        const el = this.currentInputField;
        switch (button) {
            case "{bksp}":
                if (typeof el.selectionStart === "number" && typeof el.selectionEnd === "number") {
                    const start = el.selectionStart;
                    const end = el.selectionEnd;

                    if (start === end && start > 0) {
                        el.value = el.value.slice(0, start - 1) + el.value.slice(end);
                        el.selectionStart = el.selectionEnd = start - 1;
                    } else {
                        el.value = el.value.slice(0, start) + el.value.slice(end);
                        el.selectionStart = el.selectionEnd = start;
                    }
                } else {
                    // fallback for inputs without selection
                    el.value = el.value.slice(0, -1);
                }

                el.dispatchEvent(new Event('input', { bubbles: true }));
                break;

            case "{space}":
                this.insertAtCursor(" ");
                break;

            case "{enter}":
                // Only insert newline in textarea
                if (this.currentInputField.tagName === "TEXTAREA") {
                    this.insertAtCursor("\n");
                }
                break;

            case "{tab}":
                // Move focus to the next input
                this.moveFocusToNextInput();
                break;

            case "{shift}":
            case "{lock}":
                this.layoutName = this.layoutName === "default" ? "shift" : "default";
                this.keyboardInstance.setOptions({ layoutName: this.layoutName });
                break;

            default:
                // this.insertAtCursor(button);
                break;
        }
    }

    insertAtCursor(text) {
        const el = this.currentInputField;
        if (!el) return;

        // Only use selection for compatible input types
        const selectionAllowed = el.tagName === "TEXTAREA" || el.type === "text" || el.type === "search" || el.type === "password";

        if (selectionAllowed && typeof el.selectionStart === "number" && typeof el.selectionEnd === "number") {
            const start = el.selectionStart;
            const end = el.selectionEnd;

            el.value = el.value.substring(0, start) + text + el.value.substring(end);
            el.selectionStart = el.selectionEnd = start + text.length;
        } else {
            el.value += text;
        }

        el.dispatchEvent(new Event("input", { bubbles: true }));
    }

    moveFocusToNextInput() {
        const focusable = Array.from(document.querySelectorAll('input, textarea, select, button, [tabindex]:not([tabindex="-1"])'))
            .filter(el => !el.disabled && !el.hidden && el.tabIndex >= 0);

        const index = focusable.indexOf(this.currentInputField);
        if (index > -1 && index + 1 < focusable.length) {
            focusable[index + 1].focus();
        }
    }
}


/* --------------------------------- */
/*  Dictionary */
/* --------------------------------- */

class AccessProDictionary extends AccessProFeature {
    constructor() {
        super('Dictionary', ACCESSPRO_ICONS.dictionary, 'accesspro-dictionary', 'DICTIONARY', ["Alt", "."]);

        this.name = "Dictionary";
        this.icon = ACCESSPRO_ICONS.dictionary;
        this.localStorageKey = "accesspro-dictionary";
        this.translationKey = "DICTIONARY";
        this.featureUsageKey = "accesspro-dictionary-usage";
        this.shortCutKeys = ["Alt", "."];

        this.handleDoubleClick = this.handleDoubleClick.bind(this);
        this.handleOutsideClick = this.handleOutsideClick.bind(this);

    }
    showDictionaryToast(message, duration = 3000) {
        const toast = document.getElementById("acp-dictionary-toast");
        if (!toast) return;

        toast.textContent = message;
        toast.style.display = "block";
        toast.style.opacity = 1;

        setTimeout(() => {
            toast.style.opacity = 0;
            setTimeout(() => {
                toast.style.display = "none";
            }, 500);
        }, duration);
    }
    activate(load = false) {
        super.activate(load);
        // if (!load) {
        //   this.showDictionaryToast("Double click any content to see it's meaning");
        // }
        this.showDictionaryToast("Double click any content to see it's meaning");
        document.addEventListener('dblclick', this.handleDoubleClick);
        document.addEventListener('click', this.handleOutsideClick);
    }

    deactivate(load = false) {
        super.deactivate(load);
        document.removeEventListener('dblclick', this.handleDoubleClick);
        document.removeEventListener('click', this.handleOutsideClick);
        const popup = document.getElementById('acp-definition-popup');
        if (popup) popup.style.display = 'none';
    }

    handleOutsideClick(e) {
        const popup = document.getElementById('acp-definition-popup');
        if (popup && !popup.contains(e.target)) {
            popup.style.display = 'none';
        }
    }

    async handleDoubleClick(e) {
        const selection = window.getSelection().toString().trim();
        if (!selection) return;

        const popup = document.getElementById('acp-definition-popup');
        if (!popup) return;

        popup.innerHTML = `<div style="font-family: Arial; max-width: 400px; padding: 2px;">
      <div style="font-size: 16px; font-weight: bold;">Loading definition</div>
    </div>`;
        popup.style.display = 'block';
        popup.style.top = `${e.pageY + 10}px`;
        popup.style.left = `${e.pageX + 10}px`;
        popup.style.transition = 'opacity 0.3s ease-in-out';
        popup.style.opacity = 1;

        try {
            const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${selection}`);
            const data = await res.json();
            const wordData = data[0];

            const word = wordData.word;
            const phonetic = wordData.phonetic || '';
            const audio = wordData.phonetics?.[0]?.audio || '';
            const partOfSpeech = wordData.meanings?.[0]?.partOfSpeech || '';
            const definition = wordData.meanings?.[0]?.definitions?.[0]?.definition || 'No definition found.';
            const example = wordData.meanings?.[0]?.definitions?.[0]?.example || '';
            const source = wordData.sourceUrls?.[0] || '#';

            popup.innerHTML = `
        <div style="font-family: Arial; max-width: 400px; padding: 6px;">
          <div style="font-size: 16px; font-weight: bold;">${word}</div>
          ${phonetic ? `<div style="color: gray; font-size: 14px;">${phonetic}</div>` : ''}
          ${audio ? `<audio controls style="margin-top: 5px; width: 100%;"><source src="${audio}" type="audio/mp3"></audio>` : ''}
          <div style="margin-top: 10px;">
            <span style="font-weight: bold;">${partOfSpeech}</span>: ${definition}
          </div>
          ${example ? `<div style="margin-top: 5px; font-style: italic;">"${example}"</div>` : ''}
          <div style="margin-top: 10px;">
            <a href="${source}" target="_blank" style="font-size: 12px; color: #007BFF;">Source</a>
          </div>
        </div>
      `;
        } catch (error) {
            popup.innerHTML = `Definition not found for "<strong>${selection}</strong>".`;
        }
    }
}

/* --------------------------------- */
/*  Hide Video */
/* --------------------------------- */
class AccessProHideVideo extends AccessProFeature {
    constructor() {
        super(
            'Hide Video',
            ACCESSPRO_ICONS.hideVideo,
            'accesspro-hidevideo',
            'HIDE VIDEO',
            'video',
            ["Alt", "V"]
        );

    }

    activate(load = false) {
        super.activate(load);
        document.querySelectorAll("video").forEach(video => {
            video.pause();
        });
    }

    deactivate(load = false) {
        super.deactivate(load);
    }
}

/*---------------------------------*/
/* Describe Image */
/*---------------------------------*/
class AccessProDescribeImage extends AccessProFeature {
    constructor() {
        super(
            'Describe Image',
            ACCESSPRO_ICONS.describeImage,
            'accesspro-describeimage',
            'DESCRIBE IMAGES',
            'describe-images',
            ["Alt", "B"]
        );

    }

    activate(load = false) {
        super.activate(load);
        this.aswGenerateAltTag();
    }

    async aswGenerateAltTag() {
        try {
            const arraySize = 10;
            let result = [];
            const images = Array.from(document.querySelectorAll("img:not(.asw-menu img):not(.asw-widget img)")).filter(image => image.alt === "" && image.currentSrc !== "");
            if (images.length < 1) {
                return;
            }

            // Normalize image URLs
            const normalizeUrl = url => {
                if (url.startsWith('//')) {
                    return 'https:' + url;
                }
                return url;
            };
            const _images = images.map(img => ({
                url: normalizeUrl(img.currentSrc)
            }));
            const imagesArray = [];
            for (let i = 0; i < _images.length; i += arraySize) {
                imagesArray.push(_images.slice(i, i + arraySize));
            }
            const fetchPromises = imagesArray.map(arr => fetch("https://accessibility.nerdplatoon.net/api/v1/recognization/description/bulk", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(arr)
            }).then(response => response.json()));
            const dataArray = await Promise.all(fetchPromises);
            dataArray.forEach(data => {
                if (data !== null && data !== void 0 && data.data) {
                    result = [...result, ...data.data];
                }
            });
            images.forEach(image => {
                var _result$find;
                const alt = (_result$find = result.find(r => normalizeUrl(r.url) === normalizeUrl(image.currentSrc))) === null || _result$find === void 0 ? void 0 : _result$find.caption;
                if (alt) {
                    image.alt = alt;
                }
            });
        } catch (error) {
            console.error("An error occurred:", error);
        } finally {
            const wrapper = document.getElementById("aoda-image-alt-wrapper");
            if (wrapper) {
                wrapper.remove();
            }
        }
    }

    deactivate(load = false) {
        super.deactivate(load);
    }
}





/* --------------------------------- */
/*  Page Structure */
/* --------------------------------- */
class AccessProPageStructure extends AccessProFeature {
    constructor(widgetInstance) {
        super(
            'Page Structure',
            ACCESSPRO_ICONS.pageStructure,
            'accesspro-pagestructure',
            'PAGE STRUCTURE',
            'page-structure',
            ["Alt", "Y"]
        );
        this.widget = widgetInstance;
    }

    activate() {
        // Add a class to the body for styling purposes
        document.body.classList.add('asw-pagestructure');

        // Create the tab structure
        const tabsWrapper = document.createElement('div');
        tabsWrapper.classList.add('asw-tabs-wrapper');

        const tabsHeader = document.createElement('div');
        tabsHeader.classList.add('asw-tabs-header');

        const tabsContent = document.createElement('div');
        tabsContent.classList.add('asw-tabs-content');

        // Add tabs
        const headingsTab = this.createTab('Headings', tabsHeader, tabsContent);
        const landmarksTab = this.createTab('Landmarks', tabsHeader, tabsContent);
        const linksTab = this.createTab('Links', tabsHeader, tabsContent);

        // Populate content for each tab
        this.populateHeadings(headingsTab.content);
        this.populateLandmarks(landmarksTab.content);
        this.populateLinks(linksTab.content);

        // Append header and content to the wrapper
        tabsWrapper.appendChild(tabsHeader);
        tabsWrapper.appendChild(tabsContent);

        // Pass the DOM element as the popover content
        const popoverTitle = "Page Structure";
        this.widget.showPopover(popoverTitle, tabsWrapper, true, "PAGE STRUCTURE")
    }

    deactivate() {
        // Remove the body class when deactivated
        document.body.classList.remove('asw-pagestructure');

        // remove all the asw-active classes
        document.querySelectorAll('.asw-focused').forEach(btn => btn.classList.remove('asw-focused'));
    }

    createTab(name, tabsHeader, tabsContent) {
        // Create tab button
        const tabButton = document.createElement('div');
        tabButton.setAttribute('role', 'button');
        tabButton.setAttribute('tabindex', '0');
        tabButton.textContent = name;
        tabButton.classList.add('asw-tab-button');
        tabsHeader.appendChild(tabButton);

        // Create tab content container
        const tabContent = document.createElement('div');
        tabContent.classList.add('asw-tab-content', `asw-tab-${name.toLowerCase()}`);
        tabsContent.appendChild(tabContent);

        // Set first tab as active by default
        if (tabsHeader.children.length === 1) {
            tabButton.classList.add('active');
            tabContent.classList.add('active');
        }

        // Handle tab switching
        tabButton.addEventListener('click', () => {
            // Deactivate all tabs and content
            tabsHeader.querySelectorAll('.asw-tab-button').forEach(btn => btn.classList.remove('active'));
            tabsContent.querySelectorAll('.asw-tab-content').forEach(content => content.classList.remove('active'));

            // Activate the clicked tab and corresponding content
            tabButton.classList.add('active');
            tabContent.classList.add('active');
        });

        return {
            button: tabButton,
            content: tabContent
        };
    }

    populateHeadings(container) {
        const headings = document.querySelectorAll("h1, h2, h3, h4, h5, h6");
        headings.forEach(heading => {
            let textContent = heading?.textContent.trim();
            const headingItem = this.createPageStructureItem(
                `<span class="asw-heading-tag">${heading.tagName.toUpperCase()}</span> ${textContent}`
            );

            headingItem.classList.add(`asw-heading-${heading.tagName.toLowerCase()}`);
            headingItem.addEventListener("click", () => this.focusElement(heading));
            if (textContent) {
                container.appendChild(headingItem);
            }
        });
    }

    populateLandmarks(container) {
        const landmarks = document.querySelectorAll("header, nav, main, aside, section, footer");
        landmarks.forEach(landmark => {
            const role = landmark.getAttribute("role") || landmark.tagName.toLowerCase();
            const title = landmark.getAttribute("aria-label") || landmark.getAttribute("title") || landmark.getAttribute("alt") || "";
            const landmarkItem = this.createPageStructureItem(
                `<span class="asw-heading-tag">&lt;/&gt;</span> ${role}${title ? `: ${title}` : ""}`
            );

            landmarkItem.addEventListener("click", () => this.focusElement(landmark));
            container.appendChild(landmarkItem);
        });
    }

    populateLinks(container) {
        const links = document.querySelectorAll("a");
        links.forEach(link => {
            const isNewTab = link.target === "_blank";
            let linkText = link.textContent.trim();
            if (isNewTab) linkText += " (e)";
            const linkItem = this.createPageStructureItem(
                `<span class="asw-heading-tag">&lt;a&gt;</span> ${linkText}`
            );

            linkItem.addEventListener("click", event => {
                event.preventDefault();
                this.focusElement(link);
            });
            if (linkText) {
                container.appendChild(linkItem);
            }
        });
    }

    createPageStructureItem(innerHTML) {
        const item = document.createElement("div");
        item.classList.add("asw-page-structure-item");
        item.innerHTML = innerHTML;
        return item;
    }

    focusElement(element) {
        const focusedElements = document.querySelectorAll(".asw-focused");
        focusedElements.forEach(el => el.classList.remove("asw-focused"));
        element.classList.add("asw-focused");
        element.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });
    }
}

/*--------------------------- */
/* Translate Page */
/*--------------------------- */
class AccessProTranslatePage extends AccessProFeature {
    constructor(widgetInstance) {
        super(
            'Translate Page',
            ACCESSPRO_ICONS.translatePage,
            'accesspro-translatepage',
            'TRANSLATE PAGE',
            'translate-page',
            ["Alt", "X"]
        );
        this.widget = widgetInstance;
    }

    activate() {
        const loaderStyles = `
        border-top: 3px solid #ffffff;
        border-right: 3px solid var(--acp-color-contentfg);
        border-bottom: 3px solid #ffffff;
        border-left: 3px solid var(--acp-color-contentfg);
        border-radius: 50 %;
        width: 30px;
        height: 30px;
        position: relative;
        display: inline-block;
        `;

        // Check if the loader already exists
        const existingLoader = this.element.querySelector('.acp-loader-button');
        if (existingLoader) {
            console.warn('Loader already active.');
            return;
        }

        const loader = document.createElement('div');
        loader.classList.add('acp-loader-button');
        loader.style.cssText = loaderStyles;

        this.element.classList.add('acp-feature-loading');
        this.element.querySelector('.acp-feature-icon').appendChild(loader);

        const languagesContainer = document.createElement('div');
        languagesContainer.classList.add('asw-languages-container');

        const minimumTime = new Promise((resolve) => setTimeout(resolve, 300)); // Ensures loader shows for 0.3s

        const scriptLoading = new Promise((resolve, reject) => {
            if (document.querySelector(`script[src = "${accessProGoogleLangsScript}"]`)) {
                resolve(accessProGoogleAvailableLanguages);
            } else {
                const script = document.createElement('script');
                script.src = accessProGoogleLangsScript;
                script.onload = () => resolve(accessProGoogleAvailableLanguages);
                script.onerror = () => reject('Failed to load the language script.');
                document.head.appendChild(script);
            }
        });

        Promise.all([minimumTime, scriptLoading])
            .then(([_, languages]) => {
                this.populateLanguages(languages, languagesContainer);
                this.element.classList.remove('acp-feature-loading');
                loader.remove();
            })
            .catch((error) => {
                console.error(error);
                this.element.classList.remove('acp-feature-loading');
                loader.remove();
            });

        this.isActive = false;
    }




    populateLanguages(languages, languagesContainer) {
        languages.forEach(language => {
            const languageButton = document.createElement('div');
            languageButton.setAttribute('role', 'button');
            languageButton.setAttribute('tabindex', '0');
            languageButton.textContent = language.language + " (" + language.code.toUpperCase() + ")";
            languageButton.classList.add('acp-language-button');
            languageButton.addEventListener('click', () => this.translatePage(language.code));
            languagesContainer.appendChild(languageButton);
        });

        // Create an search input with functionality to filter the languages
        const searchInput = document.createElement('input');
        searchInput.placeholder = "Search languages...";
        searchInput.classList.add('acp-language-search');
        searchInput.addEventListener('input', () => {
            const searchValue = searchInput.value.toLowerCase();
            languagesContainer.querySelectorAll('.acp-language-button').forEach(button => {
                const buttonText = button.textContent.toLowerCase();
                if (buttonText.includes(searchValue)) {
                    button.style.display = "flex";
                } else {
                    button.style.display = "none";
                }
            }
            );
        });

        languagesContainer.insertBefore(searchInput, languagesContainer.firstChild);


        // Pass the DOM element as the popover content
        const popoverTitle = "Translate Page";
        this.widget.showPopover(popoverTitle, languagesContainer, true);
    }

    deactivate() {
        // Remove the body class when deactivated
        // document.body.classList.remove('asw-translatepage');
    }

    translatePage(languageCode) {
        const currentPage = window.location.href;
        const translateUrl = `https://translate.google.com/translate?hl=en&sl=auto&tl=${languageCode}&u=${currentPage}`;
        window.location.href = translateUrl;
    }

}

/*---------------------------------*/
/* Voice Navigation */
/*---------------------------------*/


class VoiceDetector {
    constructor({ statusElSelector, outputElSelector, errorElSelector, startButtonElSelector }) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            this.setError("SpeechRecognition not supported in this browser.");
            return;
        }

        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = false;
        this.recognition.lang = 'en-US';

        this.selectors = {
            statusEl: statusElSelector,
            outputEl: outputElSelector,
            errorEl: errorElSelector,
            startButtonEl: startButtonElSelector
        }
        this.statusEl = document.querySelector(this.selectors.statusEl);
        this.outputEl = document.querySelector(this.selectors.outputEl);
        this.errorEl = document.querySelector(this.selectors.errorEl);
        this.startButtonEl = document.querySelector(this.selectors.startButtonEl);


        this.state = 'idle';
        this.isPaused = false;

        this._bindEvents();
        this.updateStatus();
    }

    _bindEvents() {
        // check if the user is already listening
        if (this.state === 'listening') {
            this.recognition.stop();
        }

        this.recognition.onstart = () => {
            this.state = 'listening';
            this.updateStatus();
        };

        this.recognition.onresult = (event) => {
            let transcript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                transcript += event.results[i][0].transcript.trim().toLowerCase();
            }
            document.querySelector(this.selectors.outputEl).textContent = transcript || "Say something...";
            this.onTranscript?.(transcript);
        };

        this.recognition.onerror = (event) => {
            this.setError(event.error);
        };

        this.recognition.onend = () => {
            if (this.state === 'listening' && !this.isPaused) {
                this.recognition.start();
            }
        };
    }

    enable() {
        this.clearError();

        if (this.state !== 'listening') {
            this.isPaused = false;
            this.recognition.start();
            this.state = 'listening';
            this.updateStatus();

            // Show the start button
            if (this.startButtonEl) {
                this.startButtonEl.style.display = 'none';
            }
        }
    }

    pause() {
        if (this.state === 'listening') {
            this.isPaused = true;
            this.recognition.stop();
            this.state = 'paused';
            this.updateStatus();

            // Show the start button
            if (this.startButtonEl) {
                this.startButtonEl.style.display = 'block';
            }
        }
    }

    disable() {
        this.isPaused = false;
        this.recognition.stop();
        this.state = 'idle';
        this.updateStatus();
        this.outputEl.textContent = '';
    }

    updateStatus() {
        const statusEl = document.querySelector(this.selectors.statusEl);
        if (statusEl) {
            statusEl.textContent = this.state.charAt(0).toUpperCase() + this.state.slice(1)
        }
    }

    setError(msg) {
        this.state = 'error';
        // this.updateStatus();
        const statusEl = document.querySelector(this.selectors.statusEl);
        statusEl.textContent = "Paused: " + msg;

        if (this.startButtonEl) {
            this.startButtonEl.style.display = 'block';
        }
    }

    clearError() {
        this.errorEl.textContent = '';
    }
}

class VoiceNavigator extends VoiceDetector {
    constructor(config, feature) {
        super(config);
        this.feature = feature;
        this.commandEl = document.querySelector(config.commandElSelector);
        this.statusEl = document.querySelector(config.statusElSelector);

        // Map labels to CSS selectors for focusable elements
        this.focusableElements = {
            'search': '#search',
            'menu': '#navigation',
            'home': '#home',
            'form': 'form',
            // Add more elements as needed
        };

        this.commands = {
            // Navigation commands
            'scroll down': () => window.scrollBy({ top: 200, behavior: 'smooth' }),
            'go down': () => window.scrollBy({ top: 200, behavior: 'smooth' }),
            'down': () => window.scrollBy({ top: 200, behavior: 'smooth' }),
            'scroll up': () => window.scrollBy({ top: -200, behavior: 'smooth' }),
            'go up': () => window.scrollBy({ top: -200, behavior: 'smooth' }),
            'up': () => window.scrollBy({ top: -200, behavior: 'smooth' }),
            'go to top': () => window.scrollTo({ top: 0, behavior: 'smooth' }),
            'go to bottom': () => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }),
            'reload': () => location.reload(),
            'stop': () => this.pause(),
            'go back': () => history.back(),
            'help': () => this.showHelp(),

            // Text editing commands
            'clear field': () => this.clearField(),
            'clear text': () => this.clearField(),
            'delete last word': () => this.deleteLastWord(),
            'delete last letter': () => this.deleteLastLetter(),
            'new line': () => this.insertNewLine(),
            'undo': () => this.undo(),

            // Accessibility commands
            'increase font size': () => this.adjustFontSize(true),
            'decrease font size': () => this.adjustFontSize(false),
            'submit': () => this.submitForm(),
        };

        this.onTranscript = (text) => this.handleCommand(text);
        this.history = []; // For undo functionality
    }

    handleCommand(transcript) {
        const clickMatch = transcript.match(/click\s+(\d+)/i);
        if (clickMatch) {
            const number = clickMatch[1];
            const element = this.feature.clickableElements.get(number);
            if (element) {
                if (element.tagName === 'INPUT' && element.type !== 'button' && element.type !== 'submit') {
                    element.focus();
                } else {
                    element.click();
                }
                this.showCommand(`Clicked element ${number}`, 2000);
                return;
            }
        }

        // Handle dynamic commands with parameters
        const pressMatch = transcript.match(/^press\s+(enter|tab|escape|space)$/i);
        if (pressMatch) {
            const key = pressMatch[1].toLowerCase();
            this.simulateKeyPress(key);
            this.showCommand(`Pressed ${key}`, 2000);
            return;
        }

        const typeMatch = transcript.match(/^type\s+(.+)$/i);
        if (typeMatch) {
            const text = typeMatch[1];
            this.typeText(text);
            this.showCommand(`Typed: ${text}`, 2000);
            return;
        }

        const focusMatch = transcript.match(/^focus\s+(.+)$/i);
        if (focusMatch) {
            const label = focusMatch[1].toLowerCase();
            this.focusElement(label);
            return;
        }

        // Existing command lookup
        const command = Object.keys(this.commands).find(cmd => transcript.includes(cmd));
        if (command) {
            this.commands[command]();
            this.showCommand(`Detected command: ${command}`, 2000);
            this.outputEl.classList.add('command-success');
            setTimeout(() => this.outputEl.classList.remove('command-success'), 1000);
        } else {
            this.showCommand(`No match: "${transcript}"`, 2000);
            this.outputEl.classList.add('command-error');
            setTimeout(() => this.outputEl.classList.remove('command-error'), 1000);
        }
    }

    // Text editing methods
    clearField() {
        const focused = document.activeElement;
        if (focused) {
            this.saveState(focused);
            if (focused.isContentEditable) {
                focused.innerText = '';
            } else {
                focused.value = '';
                const inputEvent = new Event('input', { bubbles: true });
                focused.dispatchEvent(inputEvent);
            }
            this.showCommand('Field cleared', 2000);
        }
    }

    deleteLastWord() {
        const focused = document.activeElement;
        if (focused) {
            this.saveState(focused);
            if (focused.isContentEditable) {
                const text = focused.innerText;
                focused.innerText = text.replace(/\s*\S+\s*$/, '');
            } else {
                const text = focused.value;
                focused.value = text.replace(/\s*\S+\s*$/, '');
                const inputEvent = new Event('input', { bubbles: true });
                focused.dispatchEvent(inputEvent);
            }
            this.showCommand('Last word deleted', 2000);
        }
    }

    deleteLastLetter() {
        const focused = document.activeElement;
        if (focused) {
            this.saveState(focused);
            if (focused.isContentEditable) {
                const text = focused.innerText;
                focused.innerText = text.slice(0, -1);
            } else {
                const text = focused.value;
                focused.value = text.slice(0, -1);
                const inputEvent = new Event('input', { bubbles: true });
                focused.dispatchEvent(inputEvent);
            }
            this.showCommand('Last letter deleted', 2000);
        }
    }

    insertNewLine() {
        const focused = document.activeElement;
        if (focused && focused.tagName === 'TEXTAREA') {
            this.saveState(focused);
            const cursorPos = focused.selectionStart;
            const text = focused.value;
            focused.value = text.slice(0, cursorPos) + '\n' + text.slice(cursorPos);
            focused.selectionStart = focused.selectionEnd = cursorPos + 1;
            const inputEvent = new Event('input', { bubbles: true });
            focused.dispatchEvent(inputEvent);
            this.showCommand('New line inserted', 2000);
        }
    }

    saveState(element) {
        const state = element.isContentEditable ? element.innerText : element.value;
        this.history.push(state);
        if (this.history.length > 10) this.history.shift();
    }

    undo() {
        const focused = document.activeElement;
        if (focused && this.history.length) {
            const previousState = this.history.pop();
            if (focused.isContentEditable) {
                focused.innerText = previousState;
            } else {
                focused.value = previousState;
                const inputEvent = new Event('input', { bubbles: true });
                focused.dispatchEvent(inputEvent);
            }
            this.showCommand('Undo successful', 2000);
        }
    }

    // Helper methods
    simulateKeyPress(key) {
        const event = new KeyboardEvent('keydown', { key, bubbles: true });
        document.activeElement?.dispatchEvent(event);
    }

    typeText(text) {
        const focusedElement = document.activeElement;
        if (focusedElement && (focusedElement.tagName === 'INPUT' ||
            focusedElement.tagName === 'TEXTAREA' ||
            focusedElement.isContentEditable)) {
            focusedElement.value += text;
            const inputEvent = new Event('input', { bubbles: true });
            focusedElement.dispatchEvent(inputEvent);
            this.showCommand(`Typed: ${text}`, 2000);
        } else {
            this.showCommand('No input element focused', 2000);
        }
    }

    focusElement(label) {
        const selector = this.focusableElements[label];
        if (selector) {
            const element = document.querySelector(selector);
            if (element) {
                element.focus();
                this.showCommand(`Focused: ${label}`, 2000);
            } else {
                this.showCommand(`Element "${label}" not found`, 2000);
            }
        } else {
            this.showCommand(`No mapping for "${label}"`, 2000);
        }
    }

    adjustFontSize(increase = true) {
        const html = document.documentElement;
        const currentSize = parseFloat(window.getComputedStyle(html).fontSize);
        const newSize = increase ? currentSize + 2 : currentSize - 2;
        html.style.fontSize = `${newSize}px`;
        this.showCommand(`Font size ${increase ? 'increased' : 'decreased'}`, 2000);
    }

    toggleHighContrast() {
        document.body.classList.toggle('high-contrast');
        const isActive = document.body.classList.contains('high-contrast');
        this.showCommand(`High contrast ${isActive ? 'on' : 'off'}`, 2000);
    }

    submitForm() {
        const focusedElement = document.activeElement;
        if (focusedElement) {
            const form = focusedElement.closest('form');
            if (form) {
                form.submit();
                this.showCommand('Form submitted', 2000);
            } else {
                this.showCommand('No form found', 2000);
            }
        }
    }

    showHelp() {
        const staticCommands = Object.keys(this.commands).filter(cmd => cmd !== 'help');
        const dynamicCommands = [
            'click [number]',
            'press [enter|tab|escape|space]',
            'type [text]',
            'focus [element]'
        ];
        alert('Available commands:\n' +
            [...staticCommands, ...dynamicCommands].join('\n'));
    }

    showCommand(message, duration = 3000) {
        if (this.statusEl) {
            document.querySelector(this.selectors.statusEl).textContent = message;
            if (duration) {
                setTimeout(() => {
                    if (this.statusEl.textContent === message) {
                        let message;
                        switch (this.state) {
                            case 'listening':
                                message = "Listening...";
                                break;
                            case 'paused':
                                message = "Paused";
                                break;
                            case 'error':
                                message = "Error";
                                break;
                            case 'no-speech':
                                message = "No speech detected. Paused.";
                                break;
                            default:
                                message = "Idle";
                        }
                        document.querySelector(this.selectors.statusEl).textContent = message
                    }
                }, duration);
            }
        }
    }
}

class VoiceNavigationFeature extends AccessProFeature {
    constructor() {
        super(
            'Voice Navigation',
            ACCESSPRO_ICONS.voiceNavigation,
            'voiceNavigationEnabled',
            'VOICE NAVIGATION',
            "voiceNavigation",
            'voice_navigation_usage',
            ['Alt', ';']
        );

        this.voiceNavigator = null;
        this.clickableElements = new Map();
        this.tooltips = [];

    }

    activate(load = false) {
        super.activate(load);

        // Disable talk and type feature if enabled 
        const talkAndTypeFeature = accessProFeatures.find(feature => feature.name === 'Talk and Type');
        if (talkAndTypeFeature && talkAndTypeFeature.isActive) {
            talkAndTypeFeature.deactivate();
        }

        this.renderVoiceBar();
        this.assignNumbersToClickables();

        if (!this.voiceNavigator) {
            this.voiceNavigator = new VoiceNavigator({
                statusElSelector: '#acp-voice-status',
                outputElSelector: '#acp-voice-status',
                errorElSelector: '#acp-voice-status',
                commandElSelector: '#acp-voice-status',
                startButtonElSelector: '#acp-voice-start-button',
            }, this);

            // Override help command to show modal
            this.voiceNavigator.commands['help'] = () => this.showHelpModal();
        }

        if (!this.accessProSpeech) {
            this.accessProSpeech = new AccessProSpeech();
        }

        this.voiceNavigator.enable();
        if (this.voiceNavigator.state === 'listening') {
            this.accessProSpeech.speak("Listening.");
        }

        let debounceTimeout;
        window.addEventListener('scroll', () => {
            clearTimeout(debounceTimeout);
            debounceTimeout = setTimeout(() => {
                this.assignNumbersToClickables();
            }, 100); // Adjust delay as needed
        });

    }

    deactivate(load = false) {
        super.deactivate(load);
        this.clearClickableNumbers();
        if (this.voiceNavigator) {
            this.voiceNavigator.disable();
        }
        this.removeVoiceBar();
        // if (this.accessProSpeech) this.accessProSpeech.speak("Voice navigation disabled.");
        window.removeEventListener('scroll', this.assignNumbersToClickables);
    }


    renderVoiceBar() {
        if (document.getElementById('voice-bar')) return;

        // Create main voice bar
        const bar = document.createElement('div');
        bar.id = 'voice-bar';
        bar.className = 'asw-text-speech-bar asw-voice-bar';
        bar.innerHTML = `
    <div class="voice-bar-wrapper">
      ${ACCESSPRO_ICONS.voiceNavigation}
      <span class="voice-bar-content">
        <span id="acp-voice-status" class="voice-bar-status">
        Listening...</span>
        <span id="voice-command" class="voice-bar-command"></span>
      </span>
    </div>
    <div class="voice-bar-right">
      <div role="button" tabindex="0" id="acp-voice-start-button" class="acp-voice-start-button" aria-label="Start voice control" style="display: none;">Start</div>
      <div role="button" tabindex="0" id="voice-help" class="voice-bar-help-button" aria-label="Show help">
        Need help?
      </div>
      <div role="button" tabindex="0" id="voice-close" class="asw-text-bar-close" aria-label="Close voice navigation">
        ${ACCESSPRO_ICONS.xMark}
      </div>
    </div>
  `;
        document.body.appendChild(bar);

        // Create help modal overlay





        // Accessibility enhancements

        // Event listeners
        document.getElementById('voice-help').addEventListener('click', (e) => {
            this.showHelpModal();
        });

        document.getElementById('acp-voice-start-button').addEventListener('click', () => this.activate());


        // Close handlers



        const closeBtn = document.getElementById('voice-close');
        closeBtn.addEventListener('click', () => this.toggle());


    }


    removeVoiceBar() {
        document.getElementById('voice-bar')?.remove();
        const helpOverlay = document.getElementById('voice-help-overlay');
        if (helpOverlay) {
            helpOverlay.classList.remove('visible');
        }
    }

    showHelpModal() {
        this.content = `
      <div class="help-modal-content">
        <div class="command-category">
          <h3>Navigation</h3>
          <ul>
            <li><kbd>scroll up/down</kbd> - Scroll up or down the page</li>
            <li><kbd>go to top/bottom</kbd> - Go to the top or bottom of the page</li>
            <li><kbd>reload</kbd> - Reload the page</li>
            <li><kbd>go back</kbd> - Go back to the previous page</li>
          </ul>
        </div>
        
        <div class="command-category">
          <h3>Interactions</h3>
          <ul>
            <li><kbd>click [number]</kbd> - Click on the element with the given number</li>
            <li><kbd>type [text]</kbd> - Type the given text</li>
            <li><kbd>focus [element]</kbd> - Focus on the element with the given label</li>
            <li><kbd>submit</kbd> - Submit the form</li>
          </ul>
        </div>

        <div class="command-category">
          <h3>Accessibility</h3>
          <ul>
            <li><kbd>increase/decrease font size</kbd> - Increase or decrease the font size</li>
            <li><kbd>toggle high contrast</kbd> - Toggle the high contrast mode</li>
            <li><kbd>stop</kbd> - Pause voice control</li>
          </ul>
        </div>

        <div class="command-category">
          <h3>Talk and Type</h3>
           <ul>
              <li><kbd>Clear field</kbd> / <kbd>Clear text</kbd> - Clear the field or text</li>
              <li><kbd>Delete last word</kbd> - Delete the last word</li>
              <li><kbd>Delete last letter</kbd> - Delete the last letter</li>
              <li><kbd>New line</kbd> (in textareas) - Insert a new line</li>
              <li><kbd>Undo</kbd> - Undo the last action</li>
              <li><kbd>Stop dictation</kbd> - Stop the voice control</li>
            </ul>
        </div>

        <div class="command-tips">
          <span>Tip: Speak naturally and pause between commands</span>
        </div>
      </div>
    
  `;
        // Create help modal overlay
        this._helpModal = new AccessProHelpModal({
            id: 'voice-help-overlay',
            title: 'Voice Commands Guide',
            contentHTML: this.content
        });

        this._helpModal.show();
    }

    assignNumbersToClickables() {
        if (!this.isActive) return;
        this.clearClickableNumbers();
        const selector = 'a, button, input, [role="button"], [onclick]';
        const elements = document.querySelectorAll(selector);

        let number = 1;
        elements.forEach(element => {
            // Skip hidden elements
            if (!element.offsetParent) return;

            // Skip elements inside #acp-widget
            if (element.closest('#acp-widget')) return;

            // Check if the element is in the viewport
            const rect = element.getBoundingClientRect();
            const isInViewport = (
                rect.top >= 0 &&
                rect.left >= 0 &&
                rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
                rect.right <= (window.innerWidth || document.documentElement.clientWidth)
            );
            if (!isInViewport) return;

            // Create and position tooltip
            const tooltip = document.createElement('div');
            tooltip.className = 'voice-number-tooltip';
            tooltip.textContent = number;
            tooltip.style.left = `${rect.left + window.scrollX}px`;
            tooltip.style.top = `${rect.top + window.scrollY - 15}px`;
            document.body.appendChild(tooltip);

            // Store references
            this.tooltips.push(tooltip);
            this.clickableElements.set(number.toString(), element);
            number++;
        });
    }


    clearClickableNumbers() {
        this.tooltips.forEach(tooltip => tooltip.remove());
        this.tooltips = [];
        this.clickableElements.clear();
    }

    createLiveRegion(id) {
        let el = document.getElementById(`voice-${id}`);
        if (!el) {
            el = document.createElement('div');
            el.id = `voice-${id}`;
            el.setAttribute('aria-live', 'polite');
            el.setAttribute('role', 'status');
            el.style.position = 'absolute';
            el.style.left = '-9999px'; // Hide off-screen for screen readers
            document.body.appendChild(el);
        }
        return el;
    }
}
/*---------------------------------*/




const accessProIconScript = document.createElement('script');
accessProIconScript.src = accessProIconsScript;

// store original styles of elements
document.querySelectorAll(":not(.asw-menu, .asw-menu *, .asw-widget, .asw-widget *, html, head, head *, meta, meta *, link, link *, script, script *, style, title)").forEach(el => {
    const orgTextAlign = el.style["text-align"];
    const orgColor = el.style["color"];
    const orgBgColor = el.style.backgroundColor;
    const orgFilter = el.style.filter;
    const orgBgNotImg = window.getComputedStyle(el).getPropertyValue("background-image");
    const orgFontSize = parseFloat(window.getComputedStyle(el).getPropertyValue("font-size"));
    const orgLineHeight = parseFloat(window.getComputedStyle(el).getPropertyValue("line-height"));
    const orgLetterSpacing = parseFloat(window.getComputedStyle(el).getPropertyValue("letter-spacing"));
    el.setAttribute("data-asw-orgTextAlign", orgTextAlign);
    el.setAttribute("data-asw-orgColor", orgColor);
    el.setAttribute("data-asw-orgBgColor", orgBgColor);
    el.setAttribute("data-asw-orgFontSize", orgFontSize);
    el.setAttribute("data-asw-orgLineHeight", orgLineHeight);
    el.setAttribute("data-asw-orgLetterSpacing", orgLetterSpacing);
    el.setAttribute("data-asw-orgFilter", orgFilter);
    if (orgBgNotImg && !orgBgNotImg.includes("url(")) {
        el.setAttribute("data-asw-orgBgNotImg", orgBgNotImg);
    }
});

function acpSetColorVariables({
    headerbg,
    headerfg,
    contentbg,
    contentfg,
}) {
    // set property on the asw-menu element like the :root
    document.documentElement.style.setProperty('--acp-color-headerbg', headerbg);
    document.documentElement.style.setProperty('--acp-color-headerfg', headerfg);
    document.documentElement.style.setProperty('--acp-color-contentbg', contentbg);
    document.documentElement.style.setProperty('--acp-color-contentfg', contentfg);
    document.documentElement.style.setProperty('--acp-color-buttonbg', headerbg);
    document.documentElement.style.setProperty('--acp-color-buttonfg', headerfg);
}

function accessProRenderWidget(
    settings, complianceData, user = {}
) {
    return new Promise((resolve, reject) => {
        try {
            accessProIconScript.onload = async () => {
                // accessProPlanName = user?.subscription?.name?.toLowerCase()
                accessProPlanName = "custom"
                accessProTemplate = settings.template || "default";

                const widget = new AccessPro({
                    containerId: 'acp-widget',
                    defaultLanguage: settings.default_menu_language,
                    template: settings.template,
                    settings: settings,
                    complianceData: complianceData,
                    user: user,
                });

                widget.init({
                    enable_features: settings.enable_features,
                    widget_size: settings.widget_size,
                    icon_position: settings.icon_position,
                    open_accessibility_profile: settings.open_accessibility_profile,
                    selected_languages: settings.selected_languages,
                    template: settings.template,
                });

                widget.applySavedLanguage();

                widget.applyStyles({
                    widgetSize: widget.widgetSize,
                    widgetPosition: settings.icon_position,
                    customPosition: settings.custom_position,
                })

                const enableMenuSettings = settings.enableMenuSettings || {};


                acpSetColorVariables({
                    headerbg: settings.menu_header_background_color,
                    headerfg: settings.menu_header_font_color,
                    contentbg: settings.menu_content_background_color,
                    contentfg: settings.menu_content_color,
                });

                const acpLanguages = await fetch("https://d19ntr5q8uyf0j.cloudfront.net/access-pro/languages.json").then(response => response.json());
                acpLanguages.forEach(language => {
                    if (settings?.selected_languages?.includes("all")) {
                        widget.addLanguage(new AccessProLanguage(language));
                    } else {
                        if (settings?.selected_languages?.includes(language.code))
                            widget.addLanguage(new AccessProLanguage(language));
                    }
                });

                widget.applySavedLanguage();

                let profileCollapsible
                if (enableMenuSettings?.profiles) {
                    profileCollapsible = new AccessProCollapsible(
                        'Accessibility Profiles',
                        'profile-collapsible-content',
                        settings.open_accessibility_profile,
                        "PROFILE TITLE"
                    );
                    profileCollapsible.render(document.getElementById('profileContainer'));
                }



                const textAndReadabilityContainer = document.getElementById('textAndReadabilityContainer');

                const colorAndContrastContainer = document.getElementById('colorAndContrastContainer');

                const navigationAndFocusContainer = document.getElementById('navigationAndFocusContainer');

                const mediaAndMotionContainer = document.getElementById('mediaAndMotionContainer');


                const accessProReaderProfileFeatures = []
                const accessProSeizureProfileFeatures = []
                const accessProADHDProfileFeatures = []
                const accessProCognitiveProfileFeatures = []
                const accessProVisuallyImpairedProfileFeatures = []
                const accessProMotorImpairedProfileFeatures = []
                const accessProElderlyProfileFeatures = []
                const accessProColorBlindProfileFeatures = []
                const accessProBlindProfileFeatures = []

                if (enableMenuSettings?.fontscale) {

                    if (settings?.template === "default") {
                        const fontScaleFeature = new AccessProRangeFeature(
                            "Font Scale",
                            ACCESSPRO_ICONS.fontScale,
                            "fontScaleFeatureKey",
                            "FONT SCALE",
                            "fontScaleUsageKey",
                            0.5,
                            1.5,
                            0.1
                        );
                        widget.addFeature(fontScaleFeature, textAndReadabilityContainer);
                        accessProVisuallyImpairedProfileFeatures.push({
                            feature: fontScaleFeature,
                            state: '1.5'
                        });
                        accessProMotorImpairedProfileFeatures.push({
                            feature: fontScaleFeature,
                            state: '1.5'
                        });
                        accessProElderlyProfileFeatures.push({
                            feature: fontScaleFeature,
                            state: '1.5'
                        });
                    }


                    else {
                        const accessProFontScale = new AccessProFontScale();
                        widget.addFeature(accessProFontScale, textAndReadabilityContainer);
                        accessProVisuallyImpairedProfileFeatures.push({
                            feature: accessProFontScale,
                            state: '1.5'
                        });
                        accessProMotorImpairedProfileFeatures.push({
                            feature: accessProFontScale,
                            state: '1.5'
                        });
                    }
                }

                if (enableMenuSettings.dyslexic) {
                    const accessProDyslexiaFont = new AccessProDyslexiaFont();
                    widget.addFeature(accessProDyslexiaFont, textAndReadabilityContainer);
                }

                if (enableMenuSettings.headings) {
                    const accessProLineSpacing = new AccessProLineSpacing();
                    widget.addFeature(accessProLineSpacing, textAndReadabilityContainer);
                    accessProVisuallyImpairedProfileFeatures.push({
                        feature: accessProLineSpacing,
                        state: 'wide'
                    });
                }

                if (enableMenuSettings.letterspacing) {
                    const accessProLetterSpacing = new AccessProLetterSpacing();
                    widget.addFeature(accessProLetterSpacing, textAndReadabilityContainer);
                }

                if (enableMenuSettings.fontweight) {
                    const accessProFontWeight = new AccessProFontWeight();
                    widget.addFeature(accessProFontWeight, textAndReadabilityContainer);
                }

                if (enableMenuSettings.alignment) {
                    const accessProTextAlignment = new AccessProTextAlignment();
                    widget.addFeature(accessProTextAlignment, textAndReadabilityContainer);
                }

                if (enableMenuSettings.contrast) {
                    const accessProContrastMode = new AccessProContrastMode();
                    widget.addFeature(accessProContrastMode, colorAndContrastContainer);
                    accessProElderlyProfileFeatures.push({
                        feature: accessProContrastMode,
                        state: 'high'
                    });

                    accessProColorBlindProfileFeatures.push({
                        feature: accessProContrastMode,
                        state: 'high'
                    });
                }

                if (enableMenuSettings.saturation) {
                    const accessProColorSaturation = new AccessProColorSaturation();
                    widget.addFeature(accessProColorSaturation, colorAndContrastContainer);
                    accessProSeizureProfileFeatures.push({
                        feature: accessProColorSaturation,
                        state: 'low'
                    });
                    accessProVisuallyImpairedProfileFeatures.push({
                        feature: accessProColorSaturation,
                        state: 'high'
                    });
                    accessProADHDProfileFeatures.push({
                        feature: accessProColorSaturation,
                        state: 'low'
                    });

                    accessProColorBlindProfileFeatures.push({
                        feature: accessProColorSaturation,
                        state: 'high'
                    });
                }

                // if (enableMenuSettings.colorfilters) {
                const accessProColorFilters = new AccessProColorFilters();
                widget.addFeature(accessProColorFilters, colorAndContrastContainer);
                accessProColorBlindProfileFeatures.push({
                    feature: accessProColorFilters,
                    state: 'redgreen'
                });
                // }

                if (enableMenuSettings.invertcolors) {
                    const accessProInvertColors = new AccessProInvertColors();
                    widget.addFeature(accessProInvertColors, colorAndContrastContainer);
                }

                if (enableMenuSettings.cursor) {
                    const accessProBigCursor = new AccessProBigCursor();
                    widget.addFeature(accessProBigCursor, navigationAndFocusContainer);
                    accessProMotorImpairedProfileFeatures.push({
                        feature: accessProBigCursor
                    });
                    accessProElderlyProfileFeatures.push({
                        feature: accessProBigCursor
                    });
                }

                if (enableMenuSettings.magnifier) {
                    const accessProTextMagnifier = new AccessProTextMagnifier();
                    widget.addFeature(accessProTextMagnifier, navigationAndFocusContainer);
                    accessProMotorImpairedProfileFeatures.push({
                        feature: accessProTextMagnifier
                    });
                    accessProElderlyProfileFeatures.push({
                        feature: accessProTextMagnifier
                    });
                }

                if (enableMenuSettings.readingguide) {
                    const accessProReadingGuide = new AccessProReadingGuide();
                    widget.addFeature(accessProReadingGuide, textAndReadabilityContainer);
                }

                if (enableMenuSettings.readingmask) {
                    const accessProReadingMask = new AccessProReadingMask();
                    widget.addFeature(accessProReadingMask, textAndReadabilityContainer);
                    accessProADHDProfileFeatures.push({
                        feature: accessProReadingMask
                    });
                }

                if (enableMenuSettings.links) {
                    const accessProHighlightLinks = new AccessProHighlightLinks();
                    widget.addFeature(accessProHighlightLinks, textAndReadabilityContainer);
                    accessProCognitiveProfileFeatures.push({
                        feature: accessProHighlightLinks
                    });
                }

                if (enableMenuSettings.headings) {
                    const accessProHighlightHeadings = new AccessProHighlightHeadings();
                    widget.addFeature(accessProHighlightHeadings, textAndReadabilityContainer);
                    accessProCognitiveProfileFeatures.push({
                        feature: accessProHighlightHeadings
                    });
                }

                if (enableMenuSettings.sounds) {
                    const accessProMuteSound = new AccessProMuteSound();
                    widget.addFeature(accessProMuteSound, mediaAndMotionContainer);
                }

                if (enableMenuSettings.animation) {
                    const accessProStopAnimation = new AccessProStopAnimation();
                    widget.addFeature(accessProStopAnimation, mediaAndMotionContainer);
                    accessProReaderProfileFeatures.push({
                        feature: accessProStopAnimation
                    });
                    accessProSeizureProfileFeatures.push({
                        feature: accessProStopAnimation
                    });
                    accessProADHDProfileFeatures.push({
                        feature: accessProStopAnimation
                    });
                    accessProCognitiveProfileFeatures.push({
                        feature: accessProStopAnimation
                    });
                    accessProVisuallyImpairedProfileFeatures.push({
                        feature: accessProStopAnimation
                    });
                }

                if (enableMenuSettings.images) {
                    const accessProHideImages = new AccessProHideImages();
                    widget.addFeature(accessProHideImages, mediaAndMotionContainer);
                    accessProReaderProfileFeatures.push({
                        feature: accessProHideImages
                    });
                }

                if (enableMenuSettings.videos) {
                    const accessProHideVideo = new AccessProHideVideo();
                    widget.addFeature(accessProHideVideo, mediaAndMotionContainer);
                    accessProReaderProfileFeatures.push({
                        feature: accessProHideVideo
                    });
                }

                if (accessProPlanName !== "free") {
                    if (!enableMenuSettings.translate) {
                        const accessProTranslatePage = new AccessProTranslatePage(widget);
                        widget.addFeature(accessProTranslatePage, textAndReadabilityContainer);
                    }

                    if (enableMenuSettings.describeimages) {
                        const accessProDescribeImage = new AccessProDescribeImage();
                        widget.addFeature(accessProDescribeImage, mediaAndMotionContainer);
                    }


                    if (enableMenuSettings.text2speech) {
                        accessProTextToSpeech = new AccessProTextToSpeech();
                        widget.addFeature(accessProTextToSpeech, navigationAndFocusContainer);
                        accessProBlindProfileFeatures.push({
                            feature: accessProTextToSpeech
                        });
                    }
                    if (enableMenuSettings.textsummary) {
                        accessProTextSummary = new AccessProTextSummary();
                        widget.addFeature(accessProTextSummary, navigationAndFocusContainer);
                    }
                    if (enableMenuSettings.virtualkeyboard) {
                        accessProVirtualKeyboaard = new AccessProVirtualKeyboard();
                        widget.addFeature(accessProVirtualKeyboaard, navigationAndFocusContainer);
                    }
                    if (enableMenuSettings.dictionary) {
                        accessProDictionary = new AccessProDictionary();
                        widget.addFeature(accessProDictionary, textAndReadabilityContainer);
                    }
                    if (enableMenuSettings.pagestructure) {
                        const accessProPageStructure = new AccessProPageStructure(widget);
                        widget.addFeature(accessProPageStructure, navigationAndFocusContainer);
                    }
                }

                if (enableMenuSettings.customcolors) {
                    const colorsFeature = new AccessProColorsFeature(
                        "Custom Colors",
                        "🎨",
                        "accessProColors",
                        "CUSTOM COLORS",
                        "colorsUsageKey",
                        ["Alt", "C"],
                    );
                    widget.addFeature(colorsFeature, colorAndContrastContainer);
                }




                if (enableMenuSettings.voicenavigation) {
                    const accessProVoiceNavigationFeature = new VoiceNavigationFeature();
                    widget.addFeature(accessProVoiceNavigationFeature, navigationAndFocusContainer);
                }


                if (enableMenuSettings.talkandtype) {
                    const accessProTalkAndTypeFeature = new AccessProTalkAndType();
                    widget.addFeature(accessProTalkAndTypeFeature, navigationAndFocusContainer);
                }

                if (enableMenuSettings.linknavigation) {
                    const accessProLinkNavigatorFeature = new AccessProLinkNavigatorFeature(
                        "Useful Links",
                        "",
                        "",
                        "USEFUL LINKS",
                    );
                    widget.addFeature(accessProLinkNavigatorFeature, navigationAndFocusContainer);
                }

                const profiles = []
                const freeProfiles = []

                if (enableMenuSettings.profiles) {
                    if (enableMenuSettings.readerprofile) {
                        profiles.push(new AccessProProfile(
                            'Reader',
                            'Creates a focused reading experience',
                            ACCESSPRO_ICONS.readerProfile,
                            accessProReaderProfileFeatures,
                            'READER PROFILE TITLE',
                            'reader',
                            ['Alt', 1]

                        ));
                        freeProfiles.push(new AccessProProfile(
                            'Reader',
                            'Creates a focused reading experience',
                            ACCESSPRO_ICONS.readerProfile,
                            accessProReaderProfileFeatures,
                            'READER PROFILE TITLE',
                            'reader',
                            ['Alt', 1]
                        ));
                    }

                    if (enableMenuSettings.blindprofile && enableMenuSettings.text2speech) {
                        profiles.push(new AccessProProfile(
                            'Blind Users',
                            'Enables screen reader navigation',
                            ACCESSPRO_ICONS.blindIcon,
                            accessProBlindProfileFeatures,
                            'BLIND PROFILE TITLE',
                            'elderly',
                            ['Alt', 9]
                        ));
                    }

                    if (enableMenuSettings.seizureprofile) {
                        profiles.push(new AccessProProfile(
                            'Seizure Safe',
                            'Clear Flashes & reduces color',
                            ACCESSPRO_ICONS.seizureIcon,
                            accessProSeizureProfileFeatures,
                            'SEIZURE PROFILE TITLE',
                            'seizure',
                            ['Alt', 2]
                        ));
                        freeProfiles.push(new AccessProProfile(
                            'Seizure Safe',
                            'Clear Flashes & reduces color',
                            ACCESSPRO_ICONS.seizureIcon,
                            accessProSeizureProfileFeatures,
                            'SEIZURE PROFILE TITLE',
                            'seizure',
                            ['Alt', 2]
                        ));
                    }

                    if (enableMenuSettings.adhdprofile) {
                        profiles.push(new AccessProProfile(
                            'ADHD Friendly',
                            'More focus & fewer distractions',
                            ACCESSPRO_ICONS.adhdIcon,
                            accessProADHDProfileFeatures,
                            'ADHD PROFILE TITLE',
                            'adhd',
                            ['Alt', 3]
                        ));
                    }

                    if (enableMenuSettings.cognitiveprofile) {
                        profiles.push(new AccessProProfile(
                            'Cognitive',
                            'Assists with reading & focusing',
                            ACCESSPRO_ICONS.cognitiveIcon,
                            accessProCognitiveProfileFeatures,
                            'COGNITIVE PROFILE TITLE',
                            'cognitive',
                            ['Alt', 4]
                        ));
                    }

                    if (enableMenuSettings.visuallyimpairedprofile) {
                        profiles.push(new AccessProProfile(
                            'Visually Impaired',
                            'Optimizes digital interactions',
                            ACCESSPRO_ICONS.visuallyImpairedIcon,
                            accessProVisuallyImpairedProfileFeatures,
                            'VISUALLY IMPAIRED PROFILE TITLE',
                            'visually-impaired',
                            ['Alt', 5]

                        ));
                    }

                    if (enableMenuSettings.motorimpairedprofile) {
                        profiles.push(new AccessProProfile(
                            'Motor Impaired',
                            'Eases use for those with motor impairments',
                            ACCESSPRO_ICONS.motorImpairedIcon,
                            accessProMotorImpairedProfileFeatures,
                            'MOTOR IMPAIRED PROFILE TITLE',
                            'motor-impaired',
                            ['Alt', 6]
                        ));
                    }

                    if (enableMenuSettings.elderlyprofile) {
                        profiles.push(new AccessProProfile(
                            'Elderly Users',
                            'Compensates for aging related changes',
                            ACCESSPRO_ICONS.elderlyIcon,
                            accessProElderlyProfileFeatures,
                            'ELDERLY PROFILE TITLE',
                            'elderly',
                            ['Alt', 7]
                        ));
                    }

                    if (enableMenuSettings.colorblindprofile) {
                        profiles.push(new AccessProProfile(
                            'Color Blind',
                            'Optimizes digital interactions',
                            ACCESSPRO_ICONS.colorBlindIcon,
                            accessProColorBlindProfileFeatures,
                            'COLOR BLIND PROFILE TITLE',
                            'color-blind',
                            ['Alt', 8]
                        ));
                    }
                }

                const profilesContainer = document.querySelector(".acp-profiles");

                // Render profiles inside the collapsible content
                if (enableMenuSettings.profiles) {
                    if (accessProPlanName === "free") {
                        freeProfiles.forEach(profile => widget.addProfile(profile, profileCollapsible.content))
                        if (freeProfiles.length === 0) {
                            profilesContainer.remove();
                        }
                    } else {
                        profiles.forEach(profile => widget.addProfile(profile, profileCollapsible.content));
                        if (profiles.length === 0) {
                            profilesContainer.remove();
                        }
                    }
                    // profiles.forEach((profile) => profile.render(profileCollapsible.content));
                } else {
                    if (profilesContainer) profilesContainer.remove();
                }

                // Check if the shortcuts are enabled
                if (widget.shortCutsEnabled) {
                    widget.enableShortcuts();
                }

                // For range Slider, inject the CSS at the end of the body
                const rangeSliderStyle = document.createElement('style');
                let asw_content_color = settings.menu_content_color;
                let _asw_content_color = asw_content_color;
                rangeSliderStyle.innerHTML = `.ap-range-input::-webkit-slider-thumb{
     -webkit-appearance: none;
     appearance: none;
     width: 26px !important;
     height: 26px !important;
     background: url("data:image/svg+xml,%3Csvg width='29' height='40' viewBox='0 0 29 40' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='1.43933' y='1' width='25.6797' height='38' rx='9' fill='%23${(_asw_content_color = asw_content_color) === null || _asw_content_color === void 0 ? void 0 : _asw_content_color.slice(1)}'/%3E%3Crect x='1.43933' y='1' width='25.6797' height='38' rx='9' stroke='white' stroke-width='2'/%3E%3Cmask id='mask0_884_1082' style='mask-type:alpha' maskUnits='userSpaceOnUse' x='2' y='8' width='25' height='24'%3E%3Crect x='2.27917' y='8' width='24' height='24' fill='%23D9D9D9'/%3E%3C/mask%3E%3Cg mask='url(%23mask0_884_1082)'%3E%3Cpath d='M11.2792 28C10.7292 28 10.2583 27.8042 9.86667 27.4125C9.47501 27.0208 9.27917 26.55 9.27917 26C9.27917 25.45 9.47501 24.9792 9.86667 24.5875C10.2583 24.1958 10.7292 24 11.2792 24C11.8292 24 12.3 24.1958 12.6917 24.5875C13.0833 24.9792 13.2792 25.45 13.2792 26C13.2792 26.55 13.0833 27.0208 12.6917 27.4125C12.3 27.8042 11.8292 28 11.2792 28ZM17.2792 28C16.7292 28 16.2583 27.8042 15.8667 27.4125C15.475 27.0208 15.2792 26.55 15.2792 26C15.2792 25.45 15.475 24.9792 15.8667 24.5875C16.2583 24.1958 16.7292 24 17.2792 24C17.8292 24 18.3 24.1958 18.6917 24.5875C19.0833 24.9792 19.2792 25.45 19.2792 26C19.2792 26.55 19.0833 27.0208 18.6917 27.4125C18.3 27.8042 17.8292 28 17.2792 28ZM11.2792 22C10.7292 22 10.2583 21.8042 9.86667 21.4125C9.47501 21.0208 9.27917 20.55 9.27917 20C9.27917 19.45 9.47501 18.9792 9.86667 18.5875C10.2583 18.1958 10.7292 18 11.2792 18C11.8292 18 12.3 18.1958 12.6917 18.5875C13.0833 18.9792 13.2792 19.45 13.2792 20C13.2792 20.55 13.0833 21.0208 12.6917 21.4125C12.3 21.8042 11.8292 22 11.2792 22ZM17.2792 22C16.7292 22 16.2583 21.8042 15.8667 21.4125C15.475 21.0208 15.2792 20.55 15.2792 20C15.2792 19.45 15.475 18.9792 15.8667 18.5875C16.2583 18.1958 16.7292 18 17.2792 18C17.8292 18 18.3 18.1958 18.6917 18.5875C19.0833 18.9792 19.2792 19.45 19.2792 20C19.2792 20.55 19.0833 21.0208 18.6917 21.4125C18.3 21.8042 17.8292 22 17.2792 22ZM11.2792 16C10.7292 16 10.2583 15.8042 9.86667 15.4125C9.47501 15.0208 9.27917 14.55 9.27917 14C9.27917 13.45 9.47501 12.9792 9.86667 12.5875C10.2583 12.1958 10.7292 12 11.2792 12C11.8292 12 12.3 12.1958 12.6917 12.5875C13.0833 12.9792 13.2792 13.45 13.2792 14C13.2792 14.55 13.0833 15.0208 12.6917 15.4125C12.3 15.8042 11.8292 16 11.2792 16ZM17.2792 16C16.7292 16 16.2583 15.8042 15.8667 15.4125C15.475 15.0208 15.2792 14.55 15.2792 14C15.2792 13.45 15.475 12.9792 15.8667 12.5875C16.2583 12.1958 16.7292 12 17.2792 12C17.8292 12 18.3 12.1958 18.6917 12.5875C19.0833 12.9792 19.2792 13.45 19.2792 14C19.2792 14.55 19.0833 15.0208 18.6917 15.4125C18.3 15.8042 17.8292 16 17.2792 16Z' fill='white'/%3E%3C/g%3E%3C/svg%3E%0A") center center no-repeat !important;
     background-size: cover !important;
     cursor: pointer !important;
  }</style>`
                document.body.appendChild(rangeSliderStyle);

                resolve(widget)

            }
            document.head.appendChild(accessProIconScript);

        } catch (error) {
            console.error('Error rendering widget:', error);
            reject(error);
        }

    });
}

/* --------------------------------- */
/*  Talk and Type Feature            */
/* --------------------------------- */
class AccessProTalkAndType extends AccessProFeature {
    constructor() {
        super(
            'Talk and Type',
            ACCESSPRO_ICONS.talkAndType,
            'accesspro-talkandtype',
            'TALK AND TYPE',
            'talk-and-type',
            ["Alt", "'"],
        );
        this.voiceDetector = null;
        this.isDictating = false;
        this.statusEl = null;
        this.commands = {
            'clear field': () => this.clearField(),
            'clear text': () => this.clearField(),
            'delete last word': () => this.deleteLastWord(),
            'delete last letter': () => this.deleteLastLetter(),
            'new line': () => this.insertNewLine(),
            'undo': () => this.undo(),
            'stop dictation': () => this.toggle()
        };
        this.history = [];
    }

    activate(load = false) {

        super.activate(load);

        // Disable voice navigation feature if enabled 
        const voiceNavigatorFeature = accessProFeatures.find(feature => feature.name === 'Voice Navigation');
        if (voiceNavigatorFeature && voiceNavigatorFeature.isActive) {
            voiceNavigatorFeature.deactivate();
        }

        this.renderTalkAndTypeBar();
        if (!this.voiceDetector) {
            this.voiceDetector = new VoiceDetector({
                statusElSelector: '#acp-talk-type-status',
                outputElSelector: '#acp-talk-type-status',
                errorElSelector: '#acp-talk-type-status',
                startButtonElSelector: '#acp-talk-type-start-button',
            });
            this.voiceDetector.onTranscript = (text) => this.handleDictation(text);
        }
        this.voiceDetector.enable();
        this.isDictating = true;
        if (this.voiceDetector.state === 'listening') {
            this.updateStatus('Listening...');
        }
    }

    deactivate(load = false) {
        super.deactivate(load);
        if (this.voiceDetector) {
            this.voiceDetector.disable();
        }
        this.removeTalkAndTypeBar();
        this.isDictating = false;
    }

    renderTalkAndTypeBar() {
        if (document.getElementById('talk-type-bar')) return;
        const bar = document.createElement('div');
        bar.id = 'talk-type-bar';
        bar.className = 'asw-text-speech-bar asw-talk-type-bar';
        bar.innerHTML = `
      <div class="talk-type-bar-wrapper">
        ${ACCESSPRO_ICONS.talkAndType}
        <span class="talk-type-bar-content">
          <span id="acp-talk-type-status" class="talk-type-bar-status">Idle</span>
        </span>
      </div>
      <div class="talk-type-bar-right">
        <div role="button" tabindex="0" id="acp-talk-type-start-button" class="acp-voice-start-button" aria-label="Start talk and type" style="display: none;">Start</div>
        <div role="button" tabindex="0" id="talk-type-help" class="talk-type-bar-help-button" aria-label="Show help">Help</div>
        <div role="button" tabindex="0" id="talk-type-close" class="asw-text-bar-close" aria-label="Close talk and type">${ACCESSPRO_ICONS.xMark}</div>
      </div>
    `;
        document.body.appendChild(bar);
        document.getElementById('talk-type-close').addEventListener('click', () => this.toggle());
        document.getElementById('talk-type-help').addEventListener('click', () => this.showHelpModal());
        document.getElementById('acp-talk-type-start-button').addEventListener('click', () => this.activate());
        // document.getElementById('talk-type-undo').addEventListener('click', () => this.undo());
    }

    removeTalkAndTypeBar() {
        document.getElementById('talk-type-bar')?.remove();
    }

    updateStatus(message) {
        const statusEl = document.getElementById('talk-type-status');
        if (statusEl) statusEl.textContent = message;
    }

    handleDictation(text) {
        const focused = document.activeElement;
        if (!focused || !(focused.tagName === 'INPUT' || focused.tagName === 'TEXTAREA' || focused.isContentEditable)) {
            this.updateStatus('No input field focused');
            return;
        }

        // Check for commands first
        const lowerText = text.toLowerCase().trim();
        if (this.commands[lowerText]) {
            this.commands[lowerText]();
            return;
        }

        // Save current state for undo
        this.saveState(focused);

        // Handle regular dictation
        if (focused.isContentEditable) {
            focused.innerText += ' ' + text;
        } else {
            const cursorPos = focused.selectionStart;
            const currentValue = focused.value;
            focused.value = currentValue.slice(0, cursorPos) + ' ' + text + currentValue.slice(cursorPos);
            focused.selectionStart = focused.selectionEnd = cursorPos + text.length + 1;
            const inputEvent = new Event('input', { bubbles: true });
            focused.dispatchEvent(inputEvent);
        }
        this.updateStatus('Typed: ' + text);
    }

    saveState(element) {
        const state = {
            value: element.isContentEditable ? element.innerText : element.value,
            selectionStart: element.selectionStart,
            selectionEnd: element.selectionEnd
        };
        this.history.push(state);
        if (this.history.length > 10) this.history.shift();
    }

    undo() {
        const focused = document.activeElement;
        const lastState = this.history.pop();
        if (lastState && focused) {
            if (focused.isContentEditable) {
                focused.innerText = lastState.value;
            } else {
                focused.value = lastState.value;
                focused.selectionStart = lastState.selectionStart;
                focused.selectionEnd = lastState.selectionEnd;
                const inputEvent = new Event('input', { bubbles: true });
                focused.dispatchEvent(inputEvent);
            }
            this.updateStatus('Undone');
        }
    }

    clearField() {
        const focused = document.activeElement;
        if (focused) {
            this.saveState(focused);
            if (focused.isContentEditable) {
                focused.innerText = '';
            } else {
                focused.value = '';
                const inputEvent = new Event('input', { bubbles: true });
                focused.dispatchEvent(inputEvent);
            }
            this.updateStatus('Field cleared');
        }
    }

    deleteLastWord() {
        const focused = document.activeElement;
        if (focused) {
            this.saveState(focused);
            if (focused.isContentEditable) {
                const text = focused.innerText;
                focused.innerText = text.replace(/\s*\S+\s*$/, '');
            } else {
                const text = focused.value;
                focused.value = text.replace(/\s*\S+\s*$/, '');
                const inputEvent = new Event('input', { bubbles: true });
                focused.dispatchEvent(inputEvent);
            }
            this.updateStatus('Last word deleted');
        }
    }

    deleteLastLetter() {
        const focused = document.activeElement;
        if (focused) {
            this.saveState(focused);
            if (focused.isContentEditable) {
                const text = focused.innerText;
                focused.innerText = text.slice(0, -1);
            } else {
                const text = focused.value;
                focused.value = text.slice(0, -1);
                const inputEvent = new Event('input', { bubbles: true });
                focused.dispatchEvent(inputEvent);
            }
            this.updateStatus('Last letter deleted');
        }
    }

    insertNewLine() {
        const focused = document.activeElement;
        if (focused && focused.tagName === 'TEXTAREA') {
            this.saveState(focused);
            const cursorPos = focused.selectionStart;
            const text = focused.value;
            focused.value = text.slice(0, cursorPos) + '\n' + text.slice(cursorPos);
            focused.selectionStart = focused.selectionEnd = cursorPos + 1;
            const inputEvent = new Event('input', { bubbles: true });
            focused.dispatchEvent(inputEvent);
            this.updateStatus('New line inserted');
        }
    }

    showHelpModal() {
        if (!this._helpModal) {
            this._helpModal = new AccessProHelpModal({
                id: 'talk-type-help-overlay',
                title: 'Talk and Type Guide',
                contentHTML: `
          <div class="command-category">
            <h3>Getting Started</h3>
            <ul>
              <li>Click into any input, textarea, or editable field.</li>
              <li>Start speaking — your words will be typed automatically.</li>
            </ul>
          </div>
          <div class="command-category">
            <h3>Voice Commands</h3>
            <ul>
              <li><kbd>Clear field</kbd> or <kbd>Clear text</kbd> – Clears all text from the current field</li>
              <li><kbd>Delete last word</kbd> – Removes the last word you typed</li>
              <li><kbd>Delete last letter</kbd> – Removes the last letter</li>
              <li><kbd>New line</kbd> – Moves to a new line (only works in textareas)</li>
              <li><kbd>Undo</kbd> – Reverses your last action</li>
              <li><kbd>Stop dictation</kbd> – Turns off voice typing</li>
            </ul>
          </div>
        `
            });
        }
        this._helpModal.show();
    }

}



/* --------------------------------- */
/*  Help Modal                       */
/* --------------------------------- */
class AccessProHelpModal {
    constructor({ id, title, contentHTML, titleTranslationKey }) {
        this.id = id;
        this.title = title;
        this.titleTranslationKey = titleTranslationKey;
        this.contentHTML = contentHTML;
        this.overlay = null;
        this.modal = null;
        this.closeButton = null;
        this.previousActiveElement = null;
        this._init();
    }

    _init() {
        // Only create if not already present
        let overlay = document.getElementById(this.id);
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'acp-help-modal-overlay';
            overlay.id = this.id;
            overlay.innerHTML = `
        <div class="acp-help-modal" role="dialog" aria-labelledby="${this.id}-title" aria-modal="true">
          <div class="acp-help-modal-header">
            <h2 id="${this.id}-title" ${this.titleTranslationKey ? `data-ap-translate="${this.titleTranslationKey}"` : ''}>${this.title}</h2>
            <div role="button" tabindex="0" class="acp-help-modal-close" aria-label="Close help dialog">
              ${ACCESSPRO_ICONS.xMark}
              <span class="sr-only">Close</span>
            </div>
          </div>
          <div class="acp-help-modal-content">
            ${this.contentHTML}
          </div>
        </div>
      `;
            document.body.appendChild(overlay);
        }
        this.overlay = overlay;
        this.modal = overlay.querySelector('.acp-help-modal');
        this.closeButton = overlay.querySelector('.acp-help-modal-close');
        this._setupEvents();
    }

    _setupEvents() {
        // Trap focus
        const focusableElements = this.modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        const firstFocusable = focusableElements[0];
        const lastFocusable = focusableElements[focusableElements.length - 1];
        const trapFocus = (e) => {
            if (e.key === 'Tab') {
                if (e.shiftKey && document.activeElement === firstFocusable) {
                    e.preventDefault();
                    lastFocusable.focus();
                } else if (!e.shiftKey && document.activeElement === lastFocusable) {
                    e.preventDefault();
                    firstFocusable.focus();
                }
            }
        };
        const handleEscape = (e) => {
            if (e.key === 'Escape') this.close();
        };
        this._trapFocus = trapFocus;
        this._handleEscape = handleEscape;
        this.closeButton.addEventListener('click', () => this.close());
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) this.close();
        });
        this._focusableElements = focusableElements;
        this._firstFocusable = firstFocusable;
    }

    show() {
        this.overlay.classList.add('visible');
        this.previousActiveElement = document.activeElement;
        this._firstFocusable.focus();
        this.modal.addEventListener('keydown', this._trapFocus);
        document.addEventListener('keydown', this._handleEscape);
    }

    close() {
        this.overlay.classList.remove('visible');
        this.previousActiveElement?.focus();
        this.modal.removeEventListener('keydown', this._trapFocus);
        document.removeEventListener('keydown', this._handleEscape);
    }
}
