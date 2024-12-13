import fs from "fs";
import yaml from "js-yaml";
import openapiDiff from "openapi-diff";

const SCHEMA_FILE = "./backend/openapi.yaml";
const LAST_SCHEMA_FILE = "./backend/openapi2.yaml";

async function fetchAndCompareSchemas() {
    try {
        // Load the current schema
        if (!fs.existsSync(SCHEMA_FILE)) {
            console.error(`Current schema file not found at: ${SCHEMA_FILE}`);
            return;
        }
        const currentSchemaContent = fs.readFileSync(SCHEMA_FILE, "utf-8");
        const currentSchemaJSON = yaml.load(currentSchemaContent);

        // Load the last schema if it exists
        let lastSchemaJSON = null;
        if (fs.existsSync(LAST_SCHEMA_FILE)) {
            const lastSchemaContent = fs.readFileSync(LAST_SCHEMA_FILE, "utf-8");
            lastSchemaJSON = yaml.load(lastSchemaContent);
        }

        // Compare schemas if a last schema exists
        if (lastSchemaJSON) {
            const result = await openapiDiff.diffSpecs({
                sourceSpec: {
                    content: JSON.stringify(lastSchemaJSON),
                    location: "last_openapi.json",
                    format: "openapi3",
                },
                destinationSpec: {
                    content: JSON.stringify(currentSchemaJSON),
                    location: "current_openapi.json",
                    format: "openapi3",
                },
            });

            if (result.breakingDifferencesFound) {
                console.log("\nBreaking changes detected:");
                console.table(result.breakingDifferences.map(diff => ({
                    Action: diff.action,
                    Entity: diff.entity,
                    Summary: diff.details?.description || "Details not available",
                })));
            }

            if (result.nonBreakingDifferences && result.nonBreakingDifferences.length > 0) {
                console.log("\nNon-breaking changes detected:");
                console.table(result.nonBreakingDifferences.map(diff => ({
                    Action: diff.action,
                    Entity: diff.entity,
                    Summary: diff.details?.description || "Details not available",
                })));
            }

            if (
                !result.breakingDifferencesFound &&
                (!result.nonBreakingDifferences || result.nonBreakingDifferences.length === 0)
            ) {
                console.log("\nNo changes detected.");
            }
        } else {
            console.log("No previous schema found. Storing the current schema.");
        }

        // Save the current schema for future comparisons
        fs.writeFileSync(LAST_SCHEMA_FILE, currentSchemaContent);
    } catch (error) {
        console.error("Error fetching or comparing schemas:", error);
    }
}

fetchAndCompareSchemas();
