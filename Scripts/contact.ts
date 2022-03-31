namespace core
{
    export class Contact
    {
        // private instance members
        private m_fullName: string;
        private m_contactNumber: string;
        private m_emailAddress: string;
        

        // public properties (gets & sets)
        public get FullName(): string
        {
            return this.m_fullName;
        }
    
        public set FullName(fullName: string)
        {
            this.m_fullName = fullName;
        }
    
        public get ContactNumber(): string
        {
            return this.m_contactNumber;
        }
    
        public set ContactNumber(contactNumber: string)
        {
            this.m_contactNumber = contactNumber;
        }
    
        public get EmailAddress(): string
        {
            return this.m_emailAddress;
        }
    
        public set EmailAddress(emailAddress: string)
        {
            this.m_emailAddress = emailAddress;
        }
    
        // Constructor
        constructor(fullName: string = "", contactNumber: string = "", emailAddress: string = "")
        {
            this.m_fullName = fullName;
            this.m_contactNumber = contactNumber;
            this.m_emailAddress = emailAddress;
            // `-> could have just done this, but getters and setters give options
        }
    
        // Public Utility Methods
    
        /**
         * This method converts the object's properties to a comma-separated string
         *
         * @return {(string | null)}
         */
        serialize(): string | null
        {
            // "not exactly equal"
            if(this.FullName !== "" && this.ContactNumber !== "" && this.EmailAddress !== "")
            {
                return `${this.FullName},${this.ContactNumber},${this.EmailAddress}`;
            }
            console.error("One or more properties of the Contact Object are missing or invalid");
            return null;    
        }
    
        /**
         * This method separates the data string parameter into the object's properties
         *
         * @param {string} data
         * @returns {void}
         */
        deserialize(data: string): void
        {
            let propertyArray: string[] = data.split(",");
            this.FullName = propertyArray[0];
            this.ContactNumber = propertyArray[1];
            this.EmailAddress = propertyArray[2];
    
        }
    
        // Public Overrides
        /**
         * This method overrides the built-in toString method
         *  and returns a string that contains the values of the object's properties.
         * @override
         * @return {string}
         */
        toString()
        {
            return `Full Name:      ${this.FullName}\nContact Number: ${this.ContactNumber}\nEmail Address:  ${this.EmailAddress}`;
        }
    }
}