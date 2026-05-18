const storySlotIds = {
    one: null,
    two: null,
    three: null,
    four: null
};

function loadStoriesList(stories) {
    const entries = Object.entries(stories).slice(0, 4);
    const slots = ["one", "two", "three", "four"];
    const labels = ["Primera", "Segunda", "Tercera", "Cuarta"];

    slots.forEach((slot, index) => {
        const el = document.getElementById(`option-${slot}`);
        if (!el) return;

        if (entries[index]) {
            const [id, title] = entries[index];
            storySlotIds[slot] = id;
            el.innerText = `${labels[index]} Historia: ${title}`;
        } else {
            el.style.display = "none";
        }
    });
}