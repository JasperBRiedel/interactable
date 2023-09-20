# InteractAble Site Notes
InteractAble aims to assist the users of the site, web developers and students, in developing an intuitive understanding of common web accessibility considerations and issues, along with methods to address them in practice. The key feature of the site is a set of interactive panels that accompany the written content; each interactive panel looks to demonstrate how different design properties influence accessibility under various simulated conditions.

## 1. Design Notes
### 1.1 Future improvements
#### 1.1.i Tab order for toggle switches
The current toggle switch implementation does not allow the switches to be focused and tabbed between due to limitations in how the hidden checkboxes can be selected while interacting with the visual pseudo elements.

This limitation can and should be addressed to ensure good accessibility of the websites interface. A method of addressing this issue will most likely involve allowing the label pseudo elements to be focused and including additional ARIA metadate to ensure the pourpose and interactions are clear.

#### 1.1.ii Icon font instead of SVG icons
The primary navigation currently utilises inline SVG to include icons, which introduces redundancy (SVG data cannot be cached) and impacts page performance. The inline SVG is necessary as it allows styling the SVG paths using CSS. A better alternative that would resolve the negatives of inline SVG would be the use of an icon font instead, as this will allow CSS styling while also enabling caching and better performance. 

#### 1.1.iii Improved site content and examples
The site content and interactive examples featured in this version of the site only serve as a proof of concept. This is due to a lack of detail in explanations and only very simple interactive panels.

The site content could be improved by providing more detail on the accessibility standards set out by the WCAG, inline links to relevant documentation for further reading should also be included.

The interactive examples could be improved by adding additional properties and simulation options. An additional analysis view could also be added that could provided an overview of how compliant the interactive example's preview is with the relevant accessibility guidelines.

### 1.2 Implementation details
#### 1.2.i Inline SVG
The SVG icons used in the primary navigation have been embedded inline using the SVG element, the more correct alternative would be to use the <img> element. However, the use of the inline SVG element was necessary since CSS properties need to be applied to the SVG icons as a result of various user interactions, and SVGs embedded via the <img> element *do not* allow the application of CSS properties.

A future improvement would be to switch to an icon font instead, avoiding the need for SVGs altogether.

The SVG sandboxing feature that causes this problem is mentioned here: https://stackoverflow.com/a/30419873

#### 1.2.ii Text-to-speech audio generation
The text-to-speech audio used for the screen reader example was generated using the following site: https://ttsmp3.com/. The audio files produced using this site are permissively licensed such that they can be used in the site without restriction https://ttsmp3.com/faq. 

#### 1.2.iii Markup validation
The markup of each page has been validated using the W3C Markup Validation Service (https://validator.w3.org/) and all errors have been resolved.

### 1.3 References
FontAwesome Icons used in primary navigation - https://github.com/FortAwesome/Font-Awesome

Wireframe notebook stock image used in perceivable text alternative example -  "wireframe-notebook-pexels-picjumbocom.jpg" was sourced from https://www.pexels.com/photo/notebook-beside-the-iphone-on-table-196644/ under the pexels license https://www.pexels.com/license/