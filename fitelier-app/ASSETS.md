# September 18 assets and motion studies

All six new photographs were generated with the built-in image-generation tool, then copied into this project as optimized JPEGs. They are illustrative concepts. The supplied Fitelier board is retained intact; the hero frames its primary logo with SVG and applies a warm antique-gold treatment (#A27D4B), rather than rebuilding the logo with a font.

## Project assets

- `public/assets/fitelier-hero-v3.jpg` — editorial hero.
- `public/assets/fitelier-knits.jpg` — knitwear category image.
- `public/assets/fabric-charcoal-pinstripe.jpg` — additional charcoal study.
- `public/assets/fabric-stone-hopsack.jpg` — additional stone study.
- `public/assets/fabric-navy-windowpane.jpg` — additional navy study.
- `public/assets/fabric-brown-twill.jpg` — additional brown study.
- `public/assets/fitelier-brand-board.png` — unchanged user-supplied brand reference.

Paths are relative to this document's project folder.

## Prompt set

### Hero
Use case: photorealistic-natural. Asset type: luxury menswear website editorial hero photograph, portrait 4:5. A stylish adult male wearing a softly tailored warm charcoal blazer over a fine-gauge oatmeal knitted polo and stone tailored trousers, standing naturally in a softly lit limestone atelier doorway. Full head and body with generous breathing space above the head; subject centered in the RIGHT TWO THIRDS, composition suitable for a separate brand panel to the left (no text will be over his face). Natural understated pose, real fabric grain and folds, quiet warm daylight, refined warm stone and subtle olive palette. Magazine fashion editorial, believable anatomy, elegant not flashy. No text, no logos, no graphics, no borders, no watermark. Not a collage.

### Knitwear
Use case: product-mockup. Asset type: luxury custom knitwear editorial category photograph, portrait 4:5. A fine gauge oatmeal long-sleeve knitted polo with a soft open collar, a folded muted olive crewneck, and a dark charcoal cashmere-style cardigan arranged naturally on a warm stone atelier table. Excellent visible knit texture, fine ribbed cuffs and hems, no plastic shine, tasteful real garment construction. Composition focuses on the oatmeal polo, soft side daylight, cream olive charcoal palette, quiet premium craftsmanship. No logos, text, tags with text, hands, people, graphic elements or watermark.

### Four fabric photographs
The following shared prompt was used once per material below:

Use case: product-mockup. Asset type: single fabric swatch photograph for a luxury tailoring library. Extreme close-up textile photography of [material]. One single fabric fills the entire image edge to edge, draped into one broad natural diagonal fold. Even soft daylight, visibly realistic fibers, neutral color accuracy. Portrait 4:5 frame. No other fabrics, no hands, no objects, no borders, no text, no logos, no watermark. This is an illustrative fabric study.

Materials:
- Charcoal: charcoal grey fine worsted cloth with delicate widely spaced pale grey chalk pinstripes.
- Stone: warm stone beige open basketweave hopsack cloth, subtle irregular woven texture.
- Navy: deep midnight navy cloth with understated tonal windowpane checks, no other colors.
- Brown: rich warm tobacco brown cloth with fine diagonal twill weave, solid brown without stripes.

## Motion studies

`#/motion` provides three working React variations with a replay control. No curtains or blocking splash screen are used. The main page uses Signature. All variants respect reduced-motion preferences.

- Signature — GSAP timeline draws the circular outline and reveals the supplied logo. [Official GSAP React documentation](https://gsap.com/resources/React/)
- Soft arrival — React Spring moves the image and branding into position. [Official React Spring documentation](https://react-spring.dev/docs/getting-started)
- Quiet depth — Motion adds a slow entrance and a slight pointer response. [Official Motion React documentation](https://motion.dev/docs/react)

The React island is in `src/ui/hero.jsx`. The rest of the website remains plain HTML, CSS and JavaScript; the Worker continues handling consultation requests.


## Nocturne landing photograph — September 18

Created with built-in image_gen and optimized as `public/assets/fitelier-hero-nocturne.jpg`. The same photograph is framed for desktop and mobile; existing logo and live text are separate overlays.

Exact prompt:

Use case: ads-marketing
Asset type: luxury menswear landing-page hero for Fitelier, one landscape photograph, 1536x1024.
Scene/backdrop: a blackened stone atelier at night, dark and ominous yet refined, subtle architectural depth.
Subject: one handsome adult male model in a beautifully tailored charcoal suit over dark knitwear. Tactile wool and impeccable tailoring. Visible silhouette.
Style/medium: photorealistic high-end fashion editorial, tasteful low-key film photography.
Composition/framing: wide landscape. Model positioned on the right third, body centered around 72% of image width; face fully visible within upper quarter of image. Entire left 55% is atmospheric near-black empty architectural negative space for a gold headline that will be added separately. Show model's body extending down toward bottom, with shadowy legs below. A narrow mobile crop centered on the right third must retain the face near the top and dark lower body space for a later text overlay.
Lighting/mood: subtle bronze rim light defines the face and beautiful fabric; deep charcoal and espresso shadows, restrained dramatic contrast, quiet confident pose.
Color palette: near-black, charcoal, espresso, subtle warm bronze. No olive or green cast.
Constraints: one image only. No text, logos, lettering, watermark, interface, bright windows, collage, or extra people. Left-side negative space must stay very dark and uncluttered; subject must still be discernible.
