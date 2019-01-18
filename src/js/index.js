(function () {
    try {
        var reloading = false;
        const gulp = require('gulp');
        const reload = () => {
            /* global nw */
            if (!reloading) {
                reloading = true;
                nw.App.quit();
            }
        };
        gulp.watch(['./bundle.css', './index.html', './js/**.js'], reload);
    } catch (e) { void 0; }
})();

document.addEventListener('mouseup', () => {
    window.signals.trigger('mouseup');
});
