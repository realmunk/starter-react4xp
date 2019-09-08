// Minimal example,  client-side-only rendering (renderSafe).
// Inserts simple, hard-coded props to the React component, and
// uses XP component (getComponent) to refer to the React component in the same part folder and with the same name (example.jsx)

const portal = require('/lib/xp/portal');
const React4xp = require('/lib/enonic/react4xp');

// Handle the GET request
exports.get = function(request) {
    const component = portal.getComponent();
    const props = { greetee: "world" };
    return React4xp.render(component, props, request);

    // An ID will be auto-generated, as well as an HTML body with the JSX entry rendered server-side into it.
    // Some variations for clarity:

    // request is used to determine XP viewing mode. React4xp won't do a proper react rendering and activation without it,
    // since the rendered JS from react4xp occationally clashes with XP's edit and inline modes. If request is omitted,
    // react4xp will only do a server-side rendering of the component (if possible), as a static placeholder -
    // there will be no react activation on the client-side:
    //
    // return React4xp.render(component, props);


    // props are optional: the rendering will work without them, they just won't be available to the react entry:
    //
    // return React4xp.render(component, undefined, request);


    // In the example above, the JSX file for this XP component (same folder, same name)
    // is auto-located using the 'component' argument. An equivalent but more manual way to point to the JSX file
    // would be to use the jsxPath to it:
    //
    // return React4xp.render("site/parts/01-minimal-example/01-minimal-example", props, request);
};
