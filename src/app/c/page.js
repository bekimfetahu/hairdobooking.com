import Title from "@/components/typography/Title";
import HeadingOne from "@/components/typography/HeadingOne";
import Link from "next/link";
import { sendRequest } from '@/services/sendRequest';



export default async function LocationPage() {

    const companiesData = await sendRequest({
        method: 'get',
        access_type: 'laravelApp',
        api: 'client/locations',
        data: {}
    });


    return (
        <main className="w-full bg-gray-50 py-8">
            <div className="mx-auto px-4">
                {companiesData?.data?.map((companyData) => (
                    <div
                        key={companyData.company.uuid}
                        className="w-full bg-white shadow-md rounded-lg p-6 mb-6"
                    >
                        <div className="w-full border-t border-gray-200 pt-4">
                            <Title>{companyData.company.company_name}</Title>
                            {companyData.locations.map((location) => (
                                <div
                                    key={location.uuid}
                                    className="mb-4 last:mb-0 bg-gray-100 rounded-md p-4"
                                >
                                    <h3 className="text-lg font-semibold text-gray-800">
                                        <Link href={`/c/${companyData.company.uuid}/${location.uuid}`}>
                                            {location.name}
                                        </Link>
                                    </h3>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </main>
    );
}
