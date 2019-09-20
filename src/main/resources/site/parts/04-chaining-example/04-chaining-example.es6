const portal = require('/lib/xp/portal');
const thymeleaf = require('/lib/thymeleaf');
const React4xp = require('/lib/enonic/react4xp');

const view = resolve("04-chaining-example.html");

exports.get = function(request) {

    // CLIENT-SIDE RENDERING/HYDRATION AND XP CONTENT STUDIO:
    // Just like in the previous example, it's a good idea to be aware of XP's viewing mode: are the react components
    // being displayed inside Content Studio (request.mode is 'edit' or 'inline')? If so, the client-side JS of Content
    // Studio may clash with react's JS.
    // This flag will allow client-side rendering and hydration outside Content Studio, and will be false inside Content
    // Studio. This makes React4xp render a static and un-hydrated HTML visualization of the react components here, so
    // you both get a visualization and safely running Content Studio.
    // The React4xp.render shorthand function does this automatically, but .renderBody and .renderPageContributions
    // leave this to the developer.
    const clientRender = (request.mode !== 'edit' && request.mode !== 'inline');

    // USING REACT COMPONENTS THAT ARE NOT ENTRIES:
    // Constructs a react4xp object with BuilderClickerEntry, targeting the "a-target-container" element in the view.
    // BuilderClickerEntry.jsx is in the subfolder 'mysubfolder' under the react4xp/_entries folder,
    // and nests the react component BuilderClicker.jsx in it.
    // Note that BuilderClicker.jsx is NOT a react4xp entry - it's not in below /react4xp/myChunk or /site.
    // It's imported from the dependency chunk 'myChunk' because BuilderClicker is located under /react4xp/myChunk.
    // React4xp can only access entries, so BuilderClicker is imported through BuilderClickerEntry.
    const firstReact4xpObj = new React4xp('mySubfolder/BuilderClickerEntry')
        .setId("a-target-container")
        .setProps({
            first: "Click",
            second: "ME!"
        });

    // ENTRIES CAN BE NESTED:
    // Uses the component to point to and render 04-chaining-example.jsx, in the part's own folder.
    // This JSX imports BuilderClickerEntry (demonstrating that all react4xp entries are also regular react components
    // and can be imported by other entrues). It targets the "another-target-container" element in the view:
    const secondReact4xpObj = new React4xp(portal.getComponent())
        .setId("another-target-container")
        .setProps({
            first: "No click ME!",
            second: "I do the exact same thing only better!"
        });

    // CHAINING:
    // Creates a body starting point from the local HTML view. This will be passed through multiple .renderBody functions
    // that each expand it by rendering react into it:
    let body = thymeleaf.render(view, {});

    // Chaining: passes the body through the two react4xp-objects' rendering methods.
    // firstReact4xpObj will be server-side-rendered, secondReact4xpObj will be client-side-rendered
    // (note how the clientRender parameter matches in their .renderPageContributions calls below).
    body = firstReact4xpObj.renderBody({ body });
    body = secondReact4xpObj.renderBody({ body, clientRender });

    // Chaining: creates the necessary page contributions for hydration for the first component, and passes them
    // through the second one. The second turn only appends what's necessary, so that shared components and dependency
    // chunks etc aren't loaded twice:
    let pageContributions = firstReact4xpObj.renderPageContributions();
    pageContributions = secondReact4xpObj.renderPageContributions({ pageContributions, clientRender });


    // ------------------------------
    // A horizontal separator comes here in the view: a new section,
    // demonstrating a way to repeat the same entry multiple times in a part: by using unique IDs.
    // ------------------------------


    // Note: All the next target containers don't exist in the .html view.
    // Since the react4xp-objects' IDs don't match any element ID in the body,
    // .renderBody generates and adds target container elements automatically.

    // GOTCHA: KEEP THE TARGET CONTAINER IDs UNIQUE:
    // Creates 4 components with different props: "first repeated thing", "second repeated thing", etc.
    // Note that ALL of them are given the same actual ID in setId. That means
    // they all point to the same target container element, and are all rendered into that
    // so only the last one will be visible:
    ['first', 'second', 'third', 'fourth'].forEach(cardinalNum => {
        const notUniqueComp = new React4xp('site/parts/01-minimal-example/01-minimal-example')
            .setId('this-is-not-unique')
            .setProps({ greetee: `${cardinalNum} repeated thing`});

        body = notUniqueComp.renderBody({ body });
        pageContributions = notUniqueComp.renderPageContributions({ pageContributions });
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
        pageContributions = uniqueComp.renderPageContributions({ pageContributions });
    });

    // Returning the body/pageContribution response from the part
    // (again, manually omitting the pageContributions if we're viewing the component inside Content Studio)
    return {
        body,
        pageContributions: clientRender ? pageContributions : undefined,
    };
};
