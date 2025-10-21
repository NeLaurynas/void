import {withVT} from "./viewTransition.js";

const detailView = document.querySelector('#detail-view');
const listView = document.querySelector('#list-view');
const listHeading = document.querySelector('.list-title');

const show = (el) => {
	el.hidden = false;
	el.setAttribute('aria-hidden', 'false');
};
const hide = (el) => {
	el.hidden = true;
	el.setAttribute('aria-hidden', 'true');
};

export function openPost(id, push, sourceLink) {
	// here try loading data...
	const target = document.querySelector(`article.post-detail[data-post="${id}"]`);
	if (!target) return;
	if (push) history.pushState({}, '', `/${id}`);

	withVT(() => {
		hide(listView);
		if (listHeading) hide(listHeading);
		show(detailView);
		detailView.querySelectorAll('article.post-detail').forEach((el) => {
			el.hidden = el !== target;
		});

		const newTitle = target.querySelector('.post-title');
		newTitle && newTitle.classList.add('vt-title');
	}, {
		before: () => {
			const sourceTitle = sourceLink ? sourceLink.querySelector('.post-title') : null;
			document.querySelectorAll('.vt-title').forEach((el) => el.classList.remove('vt-title'));
			sourceTitle && sourceTitle.classList.add('vt-title');
		}, after: () => document.querySelectorAll('.vt-title').forEach((el) => el.classList.remove('vt-title')),
	});
}

export function closePost(push) {
	if (push) history.pushState({}, '', '/');

	const openDetail = detailView.querySelector('article.post-detail:not([hidden])');
	const openId = openDetail ? openDetail.getAttribute('data-post') : null;
	const listLink = openId ? document.querySelector(`.post-link[data-post="${openId}"]`) : null;
	const listTitleEl = listLink ? listLink.querySelector('.post-title') : null;
	const detailTitle = openDetail ? openDetail.querySelector('.post-title') : null;

	withVT(
		() => {
			show(listView);
			if (listHeading) show(listHeading);
			hide(detailView);
			listTitleEl && listTitleEl.classList.add('vt-title');
		},
		{
			before: () => {
				document.querySelectorAll('.vt-title').forEach((el) => el.classList.remove('vt-title'));
				detailTitle && detailTitle.classList.add('vt-title');
			},
			after: () => document.querySelectorAll('.vt-title').forEach((el) => el.classList.remove('vt-title')),
		}
	);
};
