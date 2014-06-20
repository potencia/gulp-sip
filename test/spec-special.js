// This file is a place to put test artifacts tha make the linter and
// style chekcer go crazy. This file should not be analyzed by thses
// tools.

exports.stangeSpacesInFunctionDef = function ( a   ,  b	) { return a + b; };
exports.allIssuesInOneFunctionDef = function (
    a   , /* I'm like, really?
	/***/  	 b /****/ /* // yeah */ //whatever
/**\\\**** / / ***
** 
** c, d	, e		
*******\\****** / */
) { return (a + b); };
