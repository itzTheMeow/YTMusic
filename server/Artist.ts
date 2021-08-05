type Artist = {
  id: string;
  name: string;
  disambiguation: string;
  type?: string;
  gender?: string;
  country?: string;
  releases?: string[];
  releaseGroups?: string[];
};
export default Artist;
