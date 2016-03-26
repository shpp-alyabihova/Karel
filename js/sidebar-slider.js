
function SidebarSlider(initialTab) {
	this.active = null;
	this.width = initialTab.width();
	this.showTab(initialTab);
}

SidebarSlider.prototype.showTab = function(tab) {
	// console.log(tab, this.active);
	if (tab != this.active) {

		this.active = tab;

		$('.tab').css({
			'opacity': 0,
			'z-index': 1,
			'left': this.width
		});
		tab.css({
		 	'opacity': 1,
			'z-index': 2,
			'left': 0
		});

		/*
		$('.tab').hide( 'slide', {}, 1000 );
		tab.show('slide',1000);
		this.active = tab;
		*/
	}
};