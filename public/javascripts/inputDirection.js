let inputDirection = { x: 0, y: 0};
let lastDirection = { x: 0, y: 0};

window.addEventListener('keydown', e => {
    if(e.key === 'ArrowUp')
        inputDirection = { x: 0, y: -1};
    else if(e.key === 'ArrowDown')
        inputDirection = { x: 0, y: 1};
    else if(e.key === 'ArrowLeft')
        inputDirection = { x: -1, y: 0};
    else if(e.key === 'ArrowRight')
        inputDirection = { x: 1, y: 0};
})

export function getInputDirection() {
    lastDirection = inputDirection;
    return inputDirection;
}