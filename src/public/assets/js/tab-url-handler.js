$('button[data-bs-toggle="tab"]').on('shown.bs.tab', function (e) {
    const tabIndex = $(e.target).closest('li').index() + 1;
    const queryParams = new URLSearchParams(window.location.search);
    queryParams.set("tab", tabIndex);
    history.replaceState(null, null, `?${queryParams.toString()}`);
})

$(document).ready(function() {
    const queryParams = new URLSearchParams(window.location.search);
    const tabIndex = parseInt(queryParams.get("tab"));
    if(tabIndex && tabIndex > 0 && tabIndex !== NaN){
        const tabTriggerElement = document.querySelector(`.nav-tabs li:nth-child(${tabIndex}) button`)
        const tab = new bootstrap.Tab(tabTriggerElement)
        tab.show()
    }
});