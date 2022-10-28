# Tail Lighter <🕯️/>
## Identify your rendered DOM elements at the speed of a click
This is a Tailwind solution for instantly highighting HTML elements on the fly while you are developing locally.
When you've got 20 nested divs and your eyes glaze over, just click the tag and its associated rendered element will be instantly highlighted by a border in your browser.

No-code website builders always outline the elements you are working on in the hierarchy, so here's a start towards achieving that experience in React+Tailwind in VSCode.

[Demo](https://user-images.githubusercontent.com/18678490/198547259-1e66b7a6-ab03-4743-8530-49f7540a3e98.mp4)

## Disclaimer
This is a pre-beta version of this tool. It manipulates text directly in your working file and also automatically saves on each selection. It heavily relies on `tsc -w` to watch for changes.

## Quick start
- Install the extension
- Bind the `tail_lighter.toggle` command to your chosen shortcut
- Run your dev script - make sure you've got hot reload of some form. (`tsc --watch` or `next dev` if you're using NextJS)
- Toggle ON the Tail Lighter in your chosen tsx file
- Click on a line with a tag that has a `className` prop.
- Voila, dat div tho 🤘 (looking to make the colour customisable soon).


## Behavior and Limitations
- An eligible line has to be a tag that already has the `className` prop on it.
- Once Tail Lighter is toggled on, it will keep track of which tag is highlighted and will move the snipped around to wherever you select next.
- Every time there's a snipped inserted or removed, your file will be automatically saved.
- Undo and Find operations are a bit tricky. That is why there's the toggle feature. You can toggle Tail Lighter off when performing undos or finds.
- You can move between files but the memory is not portable across them for the time being. I advise you to toggle off Tail Lighter when you intend to switch working on a different file.
