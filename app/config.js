const orgs = {
    "tsg-fed": {
        url: "/services/T18CYMQSU/B2YB01JSF/jQJx96Q0UO1ieGbwVpH2OvR3"
    },
    "tsg-product-development": {
        url: "/services/T18CYMQSU/B2YB01JSF/jQJx96Q0UO1ieGbwVpH2OvR3"
    },
    "goalquest": {
        url: "/services/T18CYMQSU/B2YB01JSF/jQJx96Q0UO1ieGbwVpH2OvR3"
    }
}

/********************************************
  this should return the
  - org (in lowercase)
  - repo (in lowercase)
  - url
*********************************************/

function getConfig( repoName, payload ) {
    let retObj = {
        org: repoName.split('/')[0].toLowerCase(),
        repo: repoName.split('/')[1].toLowerCase(),
        branch: payload.ref.split('/')[2],
        url: orgs[repoName.split('/')[0].toLowerCase()].url
    };

    return retObj;
}

module.exports = getConfig