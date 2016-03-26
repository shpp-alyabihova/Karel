function go(el) {
    var menuHeight = $(".site-navigation").innerHeight();

    var position = $(el).position().top - menuHeight;
    $('body').stop().animate({
        scrollTop: position
    });
}