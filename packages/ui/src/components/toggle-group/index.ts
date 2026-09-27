import Item from "./toggle-group-item.svelte";
import Radio from "./toggle-group-radio.svelte";
import Radios from "./toggle-group-radios.svelte";
import Root from "./toggle-group.svelte";

export {
	Root,
	Item,
	// The same group as native radios, for server-rendered forms.
	Radios,
	Radio,
	//
	Root as ToggleGroup,
	Item as ToggleGroupItem,
	Radios as ToggleGroupRadios,
	Radio as ToggleGroupRadio,
};
