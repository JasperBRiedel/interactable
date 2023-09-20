// Utility functions used by the interactive panels

// Function to convert hex to rgb values
// based on: https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
const hexToRgb = (hex) => {
    var bigint = parseInt(hex.slice(1), 16);
    var r = (bigint >> 16) & 255;
    var g = (bigint >> 8) & 255;
    var b = bigint & 255;
    return [r, g, b];
}

// Function to convert rgb to hex
// based on: https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
const rgbToHex = (r, g, b) => {
    return "#" + (1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1);
}

// Function to calculate the luminance of an RGB colour
// based on: https://stackoverflow.com/questions/9733288/how-to-programmatically-calculate-the-contrast-ratio-between-two-colors
const luminance = (r, g, b) => {
    // sRGB coefficients
    const RED = 0.2126;
    const GREEN = 0.7152;
    const BLUE = 0.0722;
    const GAMMA = 2.4;

    const a = [r, g, b].map((v) => {
        v /= 255;
        return v <= 0.03928
            ? v / 12.92
            : Math.pow((v + 0.055) / 1.055, GAMMA);
    });
    return a[0] * RED + a[1] * GREEN + a[2] * BLUE;
}

// Function to calculate the contrast ratio between two HEX colours
const calculateContrast = (colorA, colorB) => {
    const luminanceA = luminance(...hexToRgb(colorA))
    const luminanceB = luminance(...hexToRgb(colorB))
    const brightest = Math.max(luminanceA, luminanceB)
    const darkest = Math.min(luminanceA, luminanceB)

    return (brightest + 0.05) / (darkest + 0.05)
}

//// Maps interactive panel IDs to associated render functions
const interactivePanelFunctions = {}

//// Interactive panel render function definitions
interactivePanelFunctions["perceivable-size-contrast"] = (state) => {

    const contrast = Math.trunc(calculateContrast(state.text_color, state.bg_color) * 100) / 100
    const textColorLuminance = luminance(...hexToRgb(state.text_color))
    const bgColorLuminance = luminance(...hexToRgb(state.bg_color))

    const textColorBlind = rgbToHex(
        textColorLuminance * 255.0,
        textColorLuminance * 255.0,
        textColorLuminance * 255.0
    )

    const bgColorBlind = rgbToHex(
        bgColorLuminance * 255.0,
        bgColorLuminance * 255.0,
        bgColorLuminance * 255.0
    )

    const calculated_text_color = state.color_blind ? textColorBlind : state.text_color
    const calculated_bg_color = state.color_blind ? bgColorBlind : state.bg_color

    const onMount = () => {
        document.getElementById("perceivable-size-contrast-font-size-display").innerHTML
            = state.font_size + 'px'
    }

    return [`
        <div
            style="
                background-color: ${calculated_bg_color};
                width: 100%;
                height: 100%;
                display: flex;
                justify-content: center;
                align-items: center;
                padding: 0.5rem;
                box-sizing: border-box;
            "
        >
            <span
                style="
                    color: ${calculated_text_color}; 
                    font-size: ${state.font_size}px;
                    text-align: center;
                "  
            >
                This text has a contrast ratio of ${contrast}:1.
            </span>
        </div>
    `, onMount]
}

interactivePanelFunctions["perceivable-alt-text"] = (state) => {

    const alternateText = state.enable_alt ? state.alt_text : ""

    if (!state.hide_graphics) {
        return [`<img 
            style="width: 70%; margin: 0.5rem;"
            src="images/wireframe-notebook-pexels-picjumbocom.jpg"
            alt="${alternateText}"
        >`]
    } else {
        return [`<div
            style="
                width: 70%; 
                margin: 0.5rem;
                box-sizing: border-box;
                aspect-ratio: 1 / 1; 
                border: 1px solid black;
                overflow-wrap: break-word;
                overflow: hidden;
            " 
        >
            ${alternateText}
        </div>`]
    }
}

// Persist focus index state between renders (this value should only be
// mutated within the following render function).
let focusedIndex = -1
interactivePanelFunctions["operable-keyboard-shortcuts"] = (state) => {
    const focusable = [
        "inter-input-1",
        "inter-input-2",
        "inter-input-3",
        "inter-input-4",
    ]

    // Shuffle tab order if invalid order toggled
    if (state.invalid_tabbing) {
        for (let index = 0; index < focusable.length; index++) {
            const randomIndexFrom = Math.floor(Math.random() * focusable.length)
            const randomIndexTo = Math.floor(Math.random() * focusable.length)

            // Swap values
            const temp = focusable[randomIndexTo]
            focusable[randomIndexTo] = focusable[randomIndexFrom]
            focusable[randomIndexFrom] = temp
        }
    }

    // Called once the generated HTML has been added to the page DOM
    const onMount = () => {
        if (state.tab && state.enable_tab_order) {
            focusedIndex = (focusedIndex + 1) % focusable.length
            const elementToFocus = document.getElementById(focusable[focusedIndex])
            // Slight delay needed to allow the button in the interactive
            // panel controls to be unfocused.
            setTimeout(() => {
                elementToFocus.focus()
            }, 50)
        }

        if (state.enter && state.enable_enter_submit) {
            // Slight delay needed to allow the button in the interactive
            // panel controls to be unfocused.
            setTimeout(() => {
                console.log("Submitting")
                document.getElementById("inter-input-3").focus()
                document.getElementById("inter-input-3").dispatchEvent(new Event("click"))
            }, 50)
        }
    }

    return [`<div style="
            display: flex; 
            flex-direction: column; 
            gap: 1rem; 
            width: max-content;
            height: max-content;
        ">
        <div>
            <label for="inter-input-1" >Text:</label>
            <input id="inter-input-1" type="text"/>
        </div>
        <div>
            <label for="inter-input-2" >Check box:</label>
            <input id="inter-input-2" type="checkbox"/>
        </div>
        <div>
            <input 
                id="inter-input-3" 
                type="submit" 
                value="Submit" 
                onclick="alert('Submit pressed')"
                style="font-size: 1rem"/>
            <input 
                id="inter-input-4" 
                type="button" 
                value="Clear" 
                onclick="alert('Clear pressed')"
                style="font-size: 1rem"/>
        </div>
    </div>`, onMount]
}

interactivePanelFunctions["operable-reduced-animation"] = (state) => {

    const animationFn = !state.motion_sensitive ? "ease"
        : "steps(4, jump-end)"
    const transitionProperties = state.reduce_animation ? ""
        : `all ${state.duration}s ${animationFn}`

    const onMount = () => {
        const toggleLabel = document.getElementById("inter-toggle-visuals-1")
        if (state.reduce_animation) {
            toggleLabel.style.setProperty("transition", "none")
        } else {
            toggleLabel.style.setProperty("transition", transitionProperties)
        }

        document.getElementById("duration_value_display").innerHTML = state.duration + 's'
    }

    return [`
        <span class="control-group">
            <input type="checkbox" id="inter-toggle-1">
            <label 
                class="toggle-switch" 
                id="inter-toggle-visuals-1"
                for="inter-toggle-1"></label>
        </span>
    `, onMount]
}

interactivePanelFunctions["understandable-content"] = (state) => {
    const complexText = `
    Utilizing convoluted and intricate language is an imperative necessity when 
    it comes to the curation of webpage content, with the ultimate goal of amplifying 
    comprehension and accessibility for a myriad of diverse audiences. The utilization 
    of highly technical jargon and a multitude of complex words creates formidable 
    barriers, impeding the potential for understanding and inducing disengagement 
    among users. Conversely, by simplifying multifaceted concepts and distilling them 
    into easily digestible information, webpages can be rendered more amenable and 
    approachable, thereby facilitating users to effortlessly navigate, swiftly 
    comprehend, and seamlessly extract the intended meaning without shouldering an 
    excessive cognitive load. This, in turn, propels inclusivity, fosters engagement, 
    and bestows user satisfaction, ultimately culminating in the all-encompassing triumph 
    and reverberating impact of the website.
    `

    const simpleText = `
    Using clear and simple language is essential when creating web content. It 
    helps people understand and access information easily. Technical jargon and 
    complex words make it hard for people to understand and can make them lose 
    interest. On the other hand, when complex ideas are explained in a simple way, 
    webpages become more accessible. People can navigate through the content without 
    difficulty, understand it quickly, and get the meaning without feeling overwhelmed. 
    This makes everyone feel included, engaged, and satisfied, leading to the success 
    and impact of the website.
    `

    const paragraphText = state.complex ? complexText : simpleText

    const paragraphTextPunctuationModified = state.no_punctuation
        ? paragraphText.replaceAll(".", " ").replaceAll(",", " ").replaceAll("-", " ")
        : paragraphText


    return [`<p
            style="margin: 0; padding: 1rem; height: 20rem; font-size: 0.75rem"
        >${paragraphTextPunctuationModified}
    </p>`]
}

interactivePanelFunctions["understandable-predictable"] = (state) => {
    return [`
        <span class="control-group">
            <input type="button" value="Accept" ${state.unpredictable ? 'class="cancel"' : ''}>
            <input type="button" value="Cancel" ${!state.unpredictable ? 'class="cancel"' : ''}>
        </span>
    `]
}

interactivePanelFunctions["robust-support"] = (state) => {
    return [`
        <div
            style="
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 0.5rem;
                font-size: ${state.alt_font ? "0.99rem" : "1rem"};
            "
        >
            <span style="color: red">Red</span>
            <span ${!state.limit_colors ? 'style="color: tomato"' : ''}>Tomato</span>
            <span style="color: green">Green</span>
            <span ${!state.limit_colors ? 'style="color: olivedrab"' : ''}>Olivedrab</span>
            <span style="color: blue">Blue</span>
            <span ${!state.limit_colors ? 'style="color: royalblue"' : ''}>Royalblue</span>
        </div>
    `]
}

let loadedAudio = null
interactivePanelFunctions["robust-assistive"] = (state) => {
    const audioUrl = state.aria_semantic
        ? (
            state.alt_text
                ? "audio/screen_reader_aria_semantic_alt.mp3"
                : "audio/screen_reader_aria_semantic.mp3"
        )
        : (
            state.alt_text
                ? "audio/screen_reader_alt.mp3"
                : "audio/screen_reader_none.mp3"
        )

    if (state.read_aloud) {
        setTimeout(() => {
            if (loadedAudio) loadedAudio.play();
        }, 100)
    }

    const onMount = () => {
        loadedAudio = new Audio(audioUrl);
    }

    return ["", onMount]
}

//// Register all render functions to associated controls and previews
Array.from(document.getElementsByClassName("interactive-panel"))
    .forEach(outerPanelElement => {
        // Find interactive panels on page
        const previewElement = outerPanelElement.getElementsByClassName("interactive-panel-preview")[0]
        const controlsElement = outerPanelElement.getElementsByClassName("interactive-panel-controls")[0]

        // Register state tracking for button presses
        Array.from(controlsElement.querySelectorAll("input[type='button']"))
            .forEach(button => {
                button.pressed = false
                button.addEventListener("mousedown", (event) => {
                    button.pressed = true
                })
                button.addEventListener("mouseup", (event) => {
                    button.pressed = false
                })
            })

        // Build state object from input states
        const handleStateChange = (event) => {
            const controlInputs = Array.from(controlsElement.querySelectorAll("input, textarea"))

            const controlInputStates = controlInputs.reduce((state, input) => {

                let value = null

                switch (input.type) {
                    case "button":
                        value = input.pressed
                        break;
                    case "checkbox":
                        value = input.checked
                        break;
                    default:
                        value = input.value
                        break;
                }

                state[input.name] = value

                return state
            }, {})

            // Call render function with state to generate DOM elements. 
            if (interactivePanelFunctions[outerPanelElement.id]) {
                const [renderedHTML, onMountCallback] = interactivePanelFunctions[outerPanelElement.id](controlInputStates)

                // Only added content to DOM if content was actually provided
                if (renderedHTML.length > 0) previewElement.innerHTML = renderedHTML;

                // Call sideeffectful code (used to hook up event 
                // listeners and manipulate the page without rendering)
                if (typeof onMountCallback == "function") onMountCallback();
            }
        }

        // Trigger rerenders on input and mouse events
        controlsElement.addEventListener("mousedown", handleStateChange)
        controlsElement.addEventListener("input", handleStateChange)

        // Trigger an initial render
        handleStateChange()
    })
