// workaround to fix this bug https://github.com/facebook/react/issues/16606

window.requestAnimationFrame = window.requestAnimationFrame.bind(window);
