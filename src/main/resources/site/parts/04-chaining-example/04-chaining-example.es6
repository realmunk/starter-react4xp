const portal = require('/lib/xp/portal');
const thymeleaf = require('/lib/thymeleaf');
const React4xp = require('/lib/enonic/react4xp');

const view = resolve("04-chaining-example.html");

exports.get = function(request) {

    // Renders BuilderClickerEntry into the "a-target-container" element in the view.
    // BuilderClickerEntry.jsx is in the subfolder 'mysubfolder' under the react4xp/_entries folder,
    // and nests the react component BuilderClicker.jsx in it.
    // Note that BuilderClicker.jsx is NOT a react4xp entry - it's imported from a dependency chunk,
    // so react4xp can't access it except through BuilderClickerEntry.
    const firstComp = new React4xp('mySubfolder/BuilderClickerEntry')
        .setId("a-target-container")
        .setProps({
            first: "Click",
            second: "ME!"
        });

    // Uses the component to point to and render 04-chaining-example.jsx, in the part's own folder.
    // It imports both BuilderClickerEntry and BuilderClicker, which will be rendered into the
    // "another-target-container" element in the view:
    const secondComp = new React4xp(portal.getComponent())
        .setId("another-target-container")
        .setProps({
            first: "No click ME!",
            second: "I do the exact same thing only better!"
        });

    // Creates a body starting point from the local HTML view:
    let body = thymeleaf.render(view, {});

    // Chaining: passes the body through the two react4xp-objects' rendering methods.
    // firstComp will be server-side-rendered, secondComp will be client-side-rendered
    // (note how the clientRender parameter matches in their .renderPageContributions calls below).
    body = firstComp.renderBody({body});
    body = secondComp.renderBody({
        body,
        clientRender: true
    });

    // Chaining: creates the necessary page contributions for hydration for the first component, and passes them
    // through the second one. The second turn only appends what's necessary, so that shared components and dependency
    // chunks etc aren't loaded twice:
    let pageContributions = firstComp.renderPageContributions();
    pageContributions = secondComp.renderPageContributions({
        pageContributions,
        clientRender: true
    });


    // ------------------------------
    // A horizontal separator comes here in the view: a new section,
    // demonstrating a way to repeat the same entry multiple times in a part: by using unique IDs.
    // ------------------------------


    // Note: All the next target containers don't exist in the .html view.
    // Since the react4xp-objects' IDs don't match any element ID in the body,
    // .renderBody generates and adds target container elements automatically.

    // Creates 4 components with different props: "first repeated thing", "second repeated thing", etc.
    // Note that ALL of them are given the same actual ID in setId. That means
    // they all point to the same target container element, and are all rendered into that
    // so only the last one will be visible:
    ['first', 'second', 'third', 'fourth'].forEach(cardinalNum => {
        const notUniqueComp = new React4xp('site/parts/01-minimal-example/01-minimal-example')
            .setId('this-is-not-unique')
            .setProps({ greetee: `${cardinalNum} repeated thing`});

        body = notUniqueComp.renderBody({body});
        pageContributions = notUniqueComp.renderPageContributions({pageContributions});
    });

    // Same as above, but with a crucial difference: adding `.uniqueId()` to the ID makes
    // React4xp add a random-number postfix to the ID. This causes each component to have a
    // different ID, so 4 container elements are added to body instead of one - and
    // all four become visible.
    ['first', 'second', 'third', 'fourth'].forEach(cardinalNum => {
        const uniqueComp = new React4xp('site/parts/01-minimal-example/01-minimal-example')
            .setId('this-id-is-unique').uniqueId()
            .setProps({ greetee: `${cardinalNum} unique thing`});

        body = uniqueComp.renderBody({body});
        pageContributions = uniqueComp.renderPageContributions({pageContributions});
    });

    // Returning the body/pageContribution response from the part
    // (again, we're manually omitting the pageContributions if we're viewing the component inside Content Studio)
    return {
        body,
        pageContributions: (request.mode === 'live' || request.mode === 'preview') ?
            pageContributions :
            undefined,
    };
};
