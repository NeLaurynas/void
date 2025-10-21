import {closePost, openPost} from "./posts.js";

window.addEventListener('popstate', route);
window.addEventListener('change', route);

export function route() {
	const id = (location.pathname || '').slice(1);
	id ? openPost(id, false) : closePost(false);
};

