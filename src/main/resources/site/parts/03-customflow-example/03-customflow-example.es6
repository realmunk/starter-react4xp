// The functions .render and .renderSafe are just shorthand methods. This example replaces them with a more explicit syntax.
// This syntax provides more fine-grained control and opportunity for logic steps when creating the React component.
// On the downside, there's no automatic rendering mode for certain viewing modes - it's recommended to take care to prevent
// react and other client-side scripts from running in edit mode in XP Content Studio.
//
// We'll construct a data-holding React4xp object (reactComp) and use it for rendering the body and the necessary page contributions.
//
// Other variations:
// - The id of the target container is inserted into the body with thymeleaf
// - The jsxPath now refers to a React component (BlueGreeter) outside of XP's /site/ structure, in the base directory /react4xp/_entries.

const portal = require('/lib/xp/portal');
const React4xp = require('/lib/enonic/react4xp');
const thymeleaf = require('/lib/thymeleaf');

const TARGET_ID = "color-greeter-id";
const view = resolve('03-customflow-example.html');
const model = {
    targetId: TARGET_ID
};

// We render an optional HTML page that the react component will be injected into.
const PRE_RENDERED_BODY_TEMPLATE = thymeleaf.render(view, model);

// Handle the GET request
exports.get = function(request) {
    const component = portal.getComponent();

    // Constructor needs one mandatory parameter: an XP component object or, as in this case, a jsxPath. 'ColorThing' is the
    // jsxPath to the entry ColorThing.jsx, since that's at the root level of the react4xp-entries folder
    // (src/main/resources/react4xp/_entries).
    const react4xpObject = new React4xp('ColorThing');

    // Builder pattern for setting additional optional attributes: setId and setProps return react4xpObject itself.
    react4xpObject
        .setId(TARGET_ID)
        .setProps({
            color: component.config.color
        });

    // Just for demonstration: a page contribution that we add to the react4xp output pageContribution by
    // passing it through .renderPageContributions below.
    const preExistingPageContributions = {
        bodyEnd: `<script>console.log('Okay, rendered the ${react4xpObject.props.color} thing.');</script>`
    };

    // Rendering a standard XP response object: body and pageContributions separately
    return {

        // .renderBody can be called without any input HTML. If so, it will surround the rendered body with empty placeholder HTML
        body: react4xpObject.renderBody({
            body: PRE_RENDERED_BODY_TEMPLATE,
        }),

        // Necessary react-activating scripts through page contributions.
        // We'll skip them if request.mode is 'inline' or 'edit', since that means the page is viewed from inside
        // XP Content Studio and there's a risk that our added scripts would interfere with Content Studio functionality.
        pageContributions: (request.mode === 'live' || request.mode === 'preview') ?
            react4xpObject.renderPageContributions({
                pageContributions: preExistingPageContributions
            }) :
            undefined
    }
};

// SERVER-SIDE VS CLIENT-SIDE RENDERING:
// Just like the .render method in examples 01 and 02, we control .renderBody and .renderPageContributions with the 'clientRender' parameter.
// In this example, body is rendered on the server-side since we didn't add a 'clientRender' parameter to .renderBody.
// Since we didn't add it to .renderPageContributions either, a .hydrate call is called on the body, in the client.
// The 'clientRender' should match between the two rendering functions:
// If we do add it to .renderBody (and it's true/truthy), only an empty container element with matching ID will be generated to body.
// So we add it to .renderPageContributions, which makes the client call .render instead of hydrate - and the empty container in body is filled with react goodness!
