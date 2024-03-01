const CLASSNAME = "-visible";
const DELAY_TEXT = 100;
const INITIAL_DELAY = 1000;

const $targetTitle = $(".title");
const $targetSentence = $(".sentence");

const animateText = () => {
    if (!$targetTitle.hasClass(CLASSNAME)) {
        requestAnimationFrame(() => {
            $targetTitle.addClass(CLASSNAME);
        });
    }

    setTimeout(() => {
        if (!$targetSentence.hasClass(CLASSNAME)) {
            requestAnimationFrame(() => {
                $targetSentence.addClass(CLASSNAME);
            });
        }
    }, DELAY_TEXT);
}

setTimeout(() => {
    animateText();
}, INITIAL_DELAY);