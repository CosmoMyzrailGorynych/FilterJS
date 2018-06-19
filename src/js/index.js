(function () {
    try {
        var reloading = false;
        const gulp = require('gulp');
        const reload = () => {
            if (!reloading) {
                reloading = true;
                window.location.reload();
            }
        };
        gulp.watch(['./bundle.css', './index.html', './js/**.js'], reload);
    } catch (e) { void 0; }
})();

document.addEventListener('mouseup', () => {
    window.signals.trigger('mouseup');
});
