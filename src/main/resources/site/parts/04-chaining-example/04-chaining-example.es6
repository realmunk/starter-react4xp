const portal = require('/lib/xp/portal');
const thymeleaf = require('/lib/thymeleaf');
const React4xp = require('/lib/enonic/react4xp');

const view = resolve("04-chaining-example.html");

exports.get = function(request) {

    // Renders BuilderClickerEntry, which nests BuilderClicker, into the "a-target-container" element:
    const firstComp = new React4xp('mySubfolder/BuilderClickerEntry')
        .setId("a-target-container")
        .setProps({
            first: "Click",
            second: "ME!"
        });

    // Uses the component to point to and render the part-local 04-chaining-example.jsx,
    // which nests BuilderClickerEntry and BuilderClicker with it, into the "another-target-container" element:
    const secondComp = new React4xp(portal.getComponent())
        .setId("another-target-container")
        .setProps({
            first: "No click ME!",
            second: "I do the exact same thing only better!"
        });

    // Creates a body starting point from the local HTML view:
    let body = thymeleaf.render(view, {});

    // Chaining: passes the body through the two components' server-side rendering methods, which add passive
    // HTML inside the two target containers in it:
    body = firstComp.renderSSRIntoContainer(body);
    body = secondComp.renderSSRIntoContainer(body);

    // Chaining: creates the necessary page contributions for hydration for the first component, and passes them
    // through the second one. The second turn only appends what's necessary, so that shared components and dependency
    // chunks etc aren't loaded twice:
    let pageContributions = firstComp.renderHydrationPageContributions();
    pageContributions = secondComp.renderHydrationPageContributions(pageContributions);


    // ------------------------------
    // A horizontal separator comes here in the view: a new section,
    // demonstrating a way to repeat the same entry multiple times in a part.
    // All the target containers here are generated and added to the body,
    // since the components' IDs don't match anything in the body.
    // ------------------------------


    // Creates 4 components with different props: "first repeated ID", "second repeated ID", etc.
    // Note that ALL of them are given the same ID. That means they are all rendered into the same
    // target container, so only the last one will be visibly rendered:
    ['first', 'second', 'third', 'fourth'].forEach(cardinalNum => {
        const notUniqueComp = new React4xp('site/parts/01-minimal-example/01-minimal-example')
            .setId('this-is-not-unique')
            .setProps({ greetee: `${cardinalNum} repeated ID`});

        body = notUniqueComp.renderTargetContainer(body);
        pageContributions = notUniqueComp.renderClientPageContributions(pageContributions);
    });

    // Same as above, but with a crucial difference: adding `.uniqueId()` to the ID makes
    // React4xp add a random-number postfix to the ID. This causes each component to have a
    // different ID, so 4 container elements are added to body instead of one - and
    // all four become visible.
    ['first', 'second', 'third', 'fourth'].forEach(cardinalNum => {
        const uniqueComp = new React4xp('site/parts/01-minimal-example/01-minimal-example')
            .setId('this-id-is-unique').uniqueId()
            .setProps({ greetee: `${cardinalNum} unique ID`});

        body = uniqueComp.renderTargetContainer(body);
        pageContributions = uniqueComp.renderClientPageContributions(pageContributions);
    });

    // Returning the body/pageContribution response from the part.
    return {
        body,
        pageContributions,
    };
};
