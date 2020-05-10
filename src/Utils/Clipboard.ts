export function copyToClipboard(text: string) {
    const isRTL = document.documentElement.getAttribute('dir') == 'rtl';

    let remoteTextArea = document.createElement('textarea');

    // Prevent zooming on iOS
    remoteTextArea.style.fontSize = '12pt';

    // Reset box model
    remoteTextArea.style.border = '0';
    remoteTextArea.style.padding = '0';
    remoteTextArea.style.margin = '0';

    // Move element out of screen horizontally
    remoteTextArea.style.position = 'absolute';
    remoteTextArea.style[isRTL ? 'right' : 'left'] = '-9999px';

    // Move element to the same position vertically
    let yPosition = window.pageYOffset || document.documentElement.scrollTop;
    remoteTextArea.style.top = `${yPosition}px`;

    remoteTextArea.setAttribute('readonly', '');
    remoteTextArea.value = text;

    document.body.appendChild(remoteTextArea)

    let selectedText = selectTextInElement(remoteTextArea);
    let ok = document.execCommand("copy")

    document.body.removeChild(remoteTextArea)

    if (ok) {
        window.getSelection().removeAllRanges();
    }

    return ok
}

function selectTextInElement(element: HTMLTextAreaElement) {
    var selectedText;

    if (element.nodeName === 'SELECT') {
        element.focus();

        selectedText = element.value;
    }
    else if (element.nodeName === 'INPUT' || element.nodeName === 'TEXTAREA') {
        let isReadOnly = element.hasAttribute('readonly');

        if (!isReadOnly) {
            element.setAttribute('readonly', '');
        }

        element.select();
        element.setSelectionRange(0, element.value.length);

        if (!isReadOnly) {
            element.removeAttribute('readonly');
        }

        selectedText = element.value;
    }
    else {
        if (element.hasAttribute('contenteditable')) {
            element.focus();
        }

        let selection = window.getSelection();
        let range = document.createRange();

        range.selectNodeContents(element);
        selection.removeAllRanges();
        selection.addRange(range);

        selectedText = selection.toString();
    }

    return selectedText;
}

