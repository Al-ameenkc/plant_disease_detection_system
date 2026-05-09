/** Labels / patterns meaning the image was not analyzable as crop disease (e.g. person, object). */

export function isNonPlantAnalysisResult(diseaseName: string): boolean {
  const n = diseaseName.toLowerCase().trim();
  return (
    /^not a plant\b/i.test(diseaseName.trim()) ||
    /\b(invalid|not applicable|not crop|no plant|human|person|animal|object|building)\b/i.test(n)
  );
}
