import { getPathOptions } from "../actions";
import PathSelectionClient from "./PathSelectionClient";

export default async function PathSelectionPage() {
  const paths = await getPathOptions();
  
  // We pass the paths to the client component. 
  // If empty, the client component will automatically trigger generation.
  return <PathSelectionClient initialPaths={paths} />;
}
