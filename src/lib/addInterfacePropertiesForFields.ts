import type {
	CustomTypeModel,
	CustomTypeModelField,
	CustomTypeModelSlice,
	SharedSliceModel,
} from "@prismicio/types";
import {
	CustomTypeModelSliceType,
	CustomTypeModelLinkSelectType,
} from "@prismicio/types";
import type { InterfaceDeclaration, SourceFile } from "ts-morph";

import { PathElement } from "../types";
import { buildFieldDocs } from "./buildFieldDocs";
import { buildSharedSliceInterfaceName } from "./buildSharedSliceInterfaceName";
import { getHumanReadableFieldPath } from "./getHumanReadableFieldPath";
import { pascalCase } from "./pascalCase";

type AddInterfacePropertyFromFieldConfig = {
	id: string;
	model: CustomTypeModelField;
	interface: InterfaceDeclaration;
	sourceFile: SourceFile;
	path: [
		PathElement<CustomTypeModel | SharedSliceModel>,
		...PathElement<CustomTypeModelField | CustomTypeModelSlice>[]
	];
};

const addInterfacePropertyFromField = (
	config: AddInterfacePropertyFromFieldConfig,
) => {
	switch (config.model.type) {
		case "UID": {
			// UID fields are not included in Data.
			break;
		}

		case "Boolean": {
			config.interface.addProperty({
				name: config.id,
				type: "prismicT.BooleanField",
				docs: buildFieldDocs({
					id: config.id,
					model: config.model,
					path: config.path,
				}),
			});

			break;
		}

		case "Color": {
			config.interface.addProperty({
				name: config.id,
				type: "prismicT.ColorField",
				docs: buildFieldDocs({
					id: config.id,
					model: config.model,
					path: config.path,
				}),
			});

			break;
		}

		case "Date": {
			config.interface.addProperty({
				name: config.id,
				type: "prismicT.DateField",
				docs: buildFieldDocs({
					id: config.id,
					model: config.model,
					path: config.path,
				}),
			});

			break;
		}

		case "Embed": {
			config.interface.addProperty({
				name: config.id,
				type: "prismicT.EmbedField",
				docs: buildFieldDocs({
					id: config.id,
					model: config.model,
					path: config.path,
				}),
			});

			break;
		}

		case "GeoPoint": {
			config.interface.addProperty({
				name: config.id,
				type: "prismicT.GeoPointField",
				docs: buildFieldDocs({
					id: config.id,
					model: config.model,
					path: config.path,
				}),
			});

			break;
		}

		case "Image": {
			if (config.model.config.thumbnails.length > 0) {
				const thumbnailNames = config.model.config.thumbnails
					.map((thumbnail) => `"${thumbnail.name}"`)
					.join(" | ");

				config.interface.addProperty({
					name: config.id,
					type: `prismicT.ImageField<${thumbnailNames}>`,
					docs: buildFieldDocs({
						id: config.id,
						model: config.model,
						path: config.path,
					}),
				});
			} else {
				config.interface.addProperty({
					name: config.id,
					type: "prismicT.ImageField<null>",
					docs: buildFieldDocs({
						id: config.id,
						model: config.model,
						path: config.path,
					}),
				});
			}

			break;
		}

		case "IntegrationFields": {
			config.interface.addProperty({
				name: config.id,
				type: "prismicT.IntegrationFields",
				docs: buildFieldDocs({
					id: config.id,
					model: config.model,
					path: config.path,
				}),
			});

			break;
		}

		case "Link": {
			switch (config.model.config.select) {
				case CustomTypeModelLinkSelectType.Document: {
					config.interface.addProperty({
						name: config.id,
						type:
							config.model.config.customtypes &&
							config.model.config.customtypes.length > 0
								? `prismicT.RelationField<${config.model.config.customtypes
										.map((type) => `"${type}"`)
										.join(" | ")}>`
								: "prismicT.RelationField",
						docs: buildFieldDocs({
							id: config.id,
							model: config.model,
							path: config.path,
						}),
					});

					break;
				}

				case CustomTypeModelLinkSelectType.Media: {
					config.interface.addProperty({
						name: config.id,
						type: "prismicT.LinkToMediaField",
						docs: buildFieldDocs({
							id: config.id,
							model: config.model,
							path: config.path,
						}),
					});

					break;
				}

				default: {
					config.interface.addProperty({
						name: config.id,
						type: "prismicT.LinkField",
						docs: buildFieldDocs({
							id: config.id,
							model: config.model,
							path: config.path,
						}),
					});
				}
			}

			break;
		}

		case "Number": {
			config.interface.addProperty({
				name: config.id,
				type: "prismicT.NumberField",
				docs: buildFieldDocs({
					id: config.id,
					model: config.model,
					path: config.path,
				}),
			});

			break;
		}

		case "StructuredText": {
			const isTitleField =
				"single" in config.model.config &&
				config.model.config.single
					.split(",")
					.every((blockType) => /heading/.test(blockType));

			if (isTitleField) {
				config.interface.addProperty({
					name: config.id,
					type: "prismicT.TitleField",
					docs: buildFieldDocs({
						id: config.id,
						model: config.model,
						path: config.path,
					}),
				});
			} else {
				config.interface.addProperty({
					name: config.id,
					type: "prismicT.RichTextField",
					docs: buildFieldDocs({
						id: config.id,
						model: config.model,
						path: config.path,
					}),
				});
			}

			break;
		}

		case "Select": {
			const options = config.model.config.options
				.map((option) => `"${option}"`)
				.join(" | ");
			const hasDefault = Boolean(config.model.config.default_value);

			if (hasDefault) {
				config.interface.addProperty({
					name: config.id,
					type: `prismicT.SelectField<${options}, "filled">`,
					docs: buildFieldDocs({
						id: config.id,
						model: config.model,
						path: config.path,
					}),
				});
			} else {
				config.interface.addProperty({
					name: config.id,
					type: `prismicT.SelectField<${options}>`,
					docs: buildFieldDocs({
						id: config.id,
						model: config.model,
						path: config.path,
					}),
				});
			}

			break;
		}

		case "Text": {
			config.interface.addProperty({
				name: config.id,
				type: "prismicT.KeyTextField",
				docs: buildFieldDocs({
					id: config.id,
					model: config.model,
					path: config.path,
				}),
			});

			break;
		}

		case "Timestamp": {
			config.interface.addProperty({
				name: config.id,
				type: "prismicT.TimestampField",
				docs: buildFieldDocs({
					id: config.id,
					model: config.model,
					path: config.path,
				}),
			});

			break;
		}

		case "Group": {
			const itemInterface = config.sourceFile.addInterface({
				name: pascalCase(
					`${config.path[0].id} Document Data ${config.id} Item`,
				),
				docs: [
					{
						description: (writer) => {
							const humanReadablePath = getHumanReadableFieldPath({
								path: [
									...config.path,
									{
										id: config.id,
										model: config.model,
									},
								],
							});

							writer.writeLine(`Item in ${humanReadablePath}`);
						},
					},
				],
			});
			addInterfacePropertiesForFields({
				interface: itemInterface,
				sourceFile: config.sourceFile,
				fields: config.model.config.fields,
				path: [
					...config.path,
					{
						id: config.id,
						model: config.model,
					},
				],
			});

			config.interface.addProperty({
				name: config.id,
				type: `prismicT.GroupField<Simplify<${itemInterface.getName()}>>`,
				docs: buildFieldDocs({
					id: config.id,
					model: config.model,
					path: config.path,
				}),
			});

			break;
		}

		case "Slices": {
			const choiceInterfaceNames: string[] = [];

			for (const choiceId in config.model.config.choices) {
				const choice = config.model.config.choices[choiceId];

				if (choice.type === CustomTypeModelSliceType.SharedSlice) {
					choiceInterfaceNames.push(
						buildSharedSliceInterfaceName({ id: choiceId }),
					);
				} else if (choice.type === CustomTypeModelSliceType.Slice) {
					let primaryInterface: InterfaceDeclaration | undefined;
					if (Object.keys(choice["non-repeat"]).length > 0) {
						primaryInterface = config.sourceFile.addInterface({
							name: pascalCase(
								`${config.path[0].id} Document Data ${config.id} ${choiceId} Slice Primary`,
							),
							docs: [
								{
									description: (writer) => {
										const humanReadablePath = getHumanReadableFieldPath({
											path: [
												...config.path,
												{
													id: config.id,
													model: config.model,
												},
												{
													id: choiceId,
													model: choice,
												},
												{
													id: "primary",
													label: "Primary",
												},
											],
										});

										writer.writeLine(`Primary content in ${humanReadablePath}`);
									},
								},
							],
						});
						addInterfacePropertiesForFields({
							interface: primaryInterface,
							sourceFile: config.sourceFile,
							fields: choice["non-repeat"],
							path: [
								...config.path,
								{
									id: config.id,
									model: config.model,
								},
								{
									id: choiceId,
									model: choice,
								},
								{
									id: "primary",
									label: "Primary",
								},
							],
						});
					}

					let itemInterface: InterfaceDeclaration | undefined;
					if (Object.keys(choice.repeat).length > 0) {
						const itemInterface = config.sourceFile.addInterface({
							name: pascalCase(
								`${config.path[0].id} Document Data ${config.id} ${choiceId} Slice Item`,
							),
							docs: [
								{
									description: (writer) => {
										const humanReadablePath = getHumanReadableFieldPath({
											path: [
												...config.path,
												{
													id: config.id,
													model: config.model,
												},
												{
													id: choiceId,
													model: choice,
												},
												{
													id: "items",
													label: "Items",
												},
											],
										});

										writer.writeLine(`Item in ${humanReadablePath}`);
									},
								},
							],
						});
						addInterfacePropertiesForFields({
							interface: itemInterface,
							sourceFile: config.sourceFile,
							fields: choice.repeat,
							path: [
								...config.path,
								{
									id: config.id,
									model: config.model,
								},
								{
									id: choiceId,
									model: choice,
								},
								{
									id: "items",
									label: "Items",
								},
							],
						});
					}

					const sliceType = config.sourceFile.addTypeAlias({
						name: pascalCase(
							`${config.path[0].id} Document Data ${config.id} ${choiceId} Slice`,
						),
						type: `prismicT.Slice<"${choiceId}", ${
							primaryInterface
								? `Simplify<${primaryInterface.getName()}>`
								: "Record<string, never>"
						}, ${
							itemInterface ? `Simplify<${itemInterface.getName()}>` : "never"
						}>`,
					});

					choiceInterfaceNames.push(sliceType.getName());
				}
			}

			const slicesType = config.sourceFile.addTypeAlias({
				name: pascalCase(
					`${config.path[0].id} Document Data ${config.id} Slice`,
				),
				type:
					choiceInterfaceNames.length > 0
						? choiceInterfaceNames.join(" | ")
						: "never",
				docs: [
					{
						description: (writer) => {
							const humanReadablePath = getHumanReadableFieldPath({
								path: [
									...config.path,
									{
										id: config.id,
										model: config.model,
									},
								],
							});

							writer.writeLine(`Slice for *${humanReadablePath}*`);
						},
					},
				],
			});

			config.interface.addProperty({
				name: config.id,
				type: `prismicT.SliceZone<${slicesType.getName()}>`,
				docs: buildFieldDocs({
					id: config.id,
					model: config.model,
					path: config.path,
				}),
			});

			break;
		}

		default: {
			config.interface.addProperty({
				name: config.id,
				type: "unknown",
				docs: buildFieldDocs({
					id: config.id,
					model: config.model,
					path: config.path,
				}),
			});
		}
	}
};

type AddInterfacePropertiesForFieldsConfig = Omit<
	AddInterfacePropertyFromFieldConfig,
	"id" | "model"
> & {
	fields: Record<string, AddInterfacePropertyFromFieldConfig["model"]>;
};

export const addInterfacePropertiesForFields = (
	config: AddInterfacePropertiesForFieldsConfig,
) => {
	for (const name in config.fields) {
		addInterfacePropertyFromField({
			...config,
			id: name,
			model: config.fields[name],
		});
	}
};