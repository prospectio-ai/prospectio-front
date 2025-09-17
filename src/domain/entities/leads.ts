import { Company } from "./company";
import { Contact } from "./contact";
import { Job } from "./job";

export interface LeadsResult {
  data: Leads;
}

export interface Leads {
  companies?: Company[];
  jobs?: Job[];
  contacts?: Contact[];
}